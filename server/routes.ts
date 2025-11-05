// server/routes.ts
// UPDATED VERSION - With 45-day price calendar endpoint integrated
// NO MOCK DATA - All endpoints use Amadeus Production API only

import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { searchFlights } from "./services/amadeusService.js";

// Extend Express Request type to include user (optional)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
      };
    }
  }
}

// ========================================
// RETRY CONFIGURATION
// ========================================
const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 2000,
  retryableStatusCodes: [503, 502, 504, 429]
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithDelay<T>(
  fn: () => Promise<T>,
  attemptNumber: number = 1
): Promise<T> {
  try {
    const result = await fn();
    if (attemptNumber > 1) {
      console.log(`✅ Retry successful on attempt ${attemptNumber}`);
    }
    return result;
  } catch (error: any) {
    const errorStatus = error.status || error.statusCode || error.response?.status;
    const errorCode = error.code;
    
    const shouldRetry = 
      attemptNumber < RETRY_CONFIG.maxAttempts &&
      (
        RETRY_CONFIG.retryableStatusCodes.includes(errorStatus) ||
        errorCode === 'ECONNRESET' ||
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ECONNREFUSED' ||
        error.message?.includes('503') ||
        error.message?.includes('timeout')
      );

    if (shouldRetry) {
      console.log(`⚠️  Attempt ${attemptNumber}/${RETRY_CONFIG.maxAttempts} failed (${errorStatus || errorCode}), retrying in ${RETRY_CONFIG.delayMs}ms...`);
      await sleep(RETRY_CONFIG.delayMs);
      return retryWithDelay(fn, attemptNumber + 1);
    }

    if (attemptNumber >= RETRY_CONFIG.maxAttempts) {
      console.error(`❌ All ${RETRY_CONFIG.maxAttempts} retry attempts failed`);
    } else {
      console.error(`❌ Non-retryable error: ${errorStatus || errorCode}`);
    }
    
    throw error;
  }
}

// ========================================
// REGISTER ROUTES
// ========================================

export function registerRoutes(app: Express): Server {

  // ========================================
  // FLIGHT SEARCH WITH REAL-TIME VALIDATION
  // ========================================
  app.post("/api/flights/search", async (req: Request, res) => {
    const startTime = Date.now();
    
    try {
      const { origin, destination, departDate, returnDate, passengers, tripType } = req.body;

      if (!origin || !destination || !departDate) {
        return res.status(400).json({ 
          message: "Missing required fields: origin, destination, and departDate are required" 
        });
      }

      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔍 NEW FLIGHT SEARCH REQUEST`);
      console.log(`${'='.repeat(80)}`);
      console.log(`Route: ${origin} → ${destination}`);
      console.log(`Date: ${departDate}${returnDate ? ` (Return: ${returnDate})` : ''}`);
      console.log(`Passengers: ${passengers || 1}`);
      console.log(`Type: ${tripType || 'round-trip'}`);
      console.log(`${'='.repeat(80)}\n`);

      let flightData;
      let isMock = false;
      let validationStats = null;

      try {
        const apiKey = process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID;
        const apiSecret = process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET;
        
        console.log('🔍 Checking Amadeus credentials...');
        console.log('   AMADEUS_API_KEY:', apiKey ? '✓ SET' : '✗ MISSING');
        console.log('   AMADEUS_API_SECRET:', apiSecret ? '✓ SET' : '✗ MISSING');

        if (!apiKey || !apiSecret) {
          console.error('❌ AMADEUS CREDENTIALS MISSING!');
          return res.status(500).json({
            success: false,
            error: 'Amadeus API credentials not configured',
            message: 'AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables are required'
          });
        }

        console.log('✅ Amadeus credentials found!');
        console.log('🚀 Using Amadeus PRODUCTION API for live flight data');
        
        flightData = await retryWithDelay(async () => {
          console.log('📡 Calling Amadeus Production API...');
          const results = await searchFlights({
            origin,
            destination,
            departDate,
            returnDate,
            passengers: passengers || 1
          });
          console.log(`✅ Amadeus returned ${results.length} live flights`);
          return results;
        });
        
        validationStats = {
          total: flightData.length,
          validated: flightData.filter((f: any) => f.isValidated).length,
          unvalidated: flightData.filter((f: any) => !f.isValidated).length
        };
        
        console.log('✅ Flight validation complete:');
        console.log('   Total flights:', validationStats.total);
        console.log('   Validated:', validationStats.validated);
        console.log('   Unvalidated:', validationStats.unvalidated);

        const duration = Date.now() - startTime;
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`✅ SEARCH COMPLETED SUCCESSFULLY`);
        console.log(`${'='.repeat(80)}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Results: ${flightData.length} flights found`);
        if (validationStats) {
          console.log(`Validation: ${validationStats.validated}/${validationStats.total} validated (${Math.round(validationStats.validated / validationStats.total * 100)}%)`);
        }
        console.log(`${'='.repeat(80)}\n`);

      } catch (apiError: any) {
        console.error('\n' + '='.repeat(80));
        console.error('❌ AMADEUS API ERROR');
        console.error('='.repeat(80));
        console.error('Error type:', apiError.name || 'Unknown');
        console.error('Error message:', apiError.message);
        console.error('='.repeat(80) + '\n');
        
        if (apiError.response?.status === 401 || apiError.message?.includes('authentication')) {
          return res.status(401).json({
            success: false,
            error: 'Authentication failed with Amadeus API',
            message: 'Please verify your AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables',
            code: 'AUTH_FAILED'
          });
        }

        if (apiError.response?.status === 404 || apiError.message?.includes('No flights found')) {
          return res.status(404).json({
            success: false,
            error: 'No flights found',
            message: `No available flights found for ${origin} to ${destination} on ${departDate}`,
            code: 'NO_FLIGHTS_FOUND'
          });
        }

        if (apiError.response?.status === 429) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests to Amadeus API. Please try again later.',
            code: 'RATE_LIMIT'
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch flight data',
          message: apiError.message || 'Unable to retrieve flights from Amadeus API',
          code: 'API_ERROR',
          details: process.env.NODE_ENV === 'development' ? apiError.response?.data : undefined
        });
      }

      res.json({
        success: true,
        data: flightData,
        mock: isMock,
        searchParams: {
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          departDate,
          returnDate,
          passengers: passengers || 1,
          tripType: tripType || 'round-trip'
        },
        meta: {
          count: flightData.length,
          duration: Date.now() - startTime,
          validation: validationStats
        }
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`\n${'='.repeat(80)}`);
      console.error(`❌ SEARCH FAILED`);
      console.error(`${'='.repeat(80)}`);
      console.error(`Error: ${error.message}`);
      console.error(`Duration: ${duration}ms`);
      console.error(`${'='.repeat(80)}\n`);
      
      res.status(500).json({ 
        message: error.message || "Failed to search flights. Please try again.",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // ========================================
  // PRICE CALENDAR - 45 DAY PRICE TRENDS (30 DAYS BEFORE + 15 DAYS AFTER)
  // NO MOCK DATA - AMADEUS PRODUCTION API ONLY
  // ========================================
  app.post("/api/flights/price-calendar-45day", async (req: Request, res) => {
    const startTime = Date.now();
    
    try {
      const { origin, destination, departDate, passengers = 1 } = req.body;

      if (!origin || !destination || !departDate) {
        return res.status(400).json({ 
          message: "Missing required fields: origin, destination, and departDate" 
        });
      }

      const apiKey = process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID;
      const apiSecret = process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET;
      
      if (!apiKey || !apiSecret) {
        console.error('❌ AMADEUS CREDENTIALS MISSING FOR 45-DAY PRICE CALENDAR!');
        return res.status(500).json({
          success: false,
          error: 'Amadeus API credentials not configured',
          message: 'AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables are required'
        });
      }

      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 45-DAY PRICE CALENDAR REQUEST - REAL DATA ONLY`);
      console.log(`${'='.repeat(80)}`);
      console.log(`Route: ${origin} → ${destination}`);
      console.log(`Search Date: ${departDate}`);
      console.log(`Date Range: 30 days before + 15 days after = 45 days total`);
      console.log(`API: Amadeus Production (NO MOCK DATA)`);
      console.log(`${'='.repeat(80)}\n`);

      const searchDate = new Date(departDate);
      const priceData: Array<{
        date: string;
        price: number | null;
        flightData: any | null;
        status: 'success' | 'no_flights' | 'error';
        daysFromSearch: number;
      }> = [];

      const startDate = new Date(searchDate);
      startDate.setDate(startDate.getDate() - 30);
      
      const endDate = new Date(searchDate);
      endDate.setDate(endDate.getDate() + 15);

      const totalDays = 45;
      const batchSize = 3;
      
      console.log(`🔄 Starting to fetch REAL prices for ${totalDays} dates...`);
      console.log(`   From: ${startDate.toISOString().split('T')[0]}`);
      console.log(`   To: ${endDate.toISOString().split('T')[0]}`);
      console.log(`   Search Date: ${departDate}`);
      console.log(`⚠️  This will take ~${Math.ceil(totalDays / batchSize)} batches\n`);
      
      for (let batch = 0; batch < Math.ceil(totalDays / batchSize); batch++) {
        const batchPromises = [];
        
        for (let i = 0; i < batchSize; i++) {
          const dayIndex = batch * batchSize + i;
          if (dayIndex >= totalDays) break;
          
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + dayIndex);
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          const dateStr = currentDate.toISOString().split('T')[0];
          const daysFromSearch = Math.round((currentDate.getTime() - searchDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (currentDate < yesterday) {
            priceData.push({
              date: dateStr,
              price: null,
              flightData: null,
              status: 'error',
              daysFromSearch
            });
            continue;
          }
          
          const promise = searchFlights({
            origin,
            destination,
            departDate: dateStr,
            passengers,
            maxResults: 20
          })
            .then((flights) => {
              if (flights.length === 0) {
                console.log(`   ⚠️  ${dateStr} (${daysFromSearch > 0 ? '+' : ''}${daysFromSearch}d): No flights`);
                return {
                  date: dateStr,
                  price: null,
                  flightData: null,
                  status: 'no_flights' as const,
                  daysFromSearch
                };
              }
              
              const cheapestFlight = flights.reduce((min, flight) => 
                flight.price < min.price ? flight : min
              );
              
              const marker = dateStr === departDate ? ' 🎯' : '';
              console.log(`   ✅ ${dateStr} (${daysFromSearch > 0 ? '+' : ''}${daysFromSearch}d): ₹${cheapestFlight.price}${marker}`);
              
              return {
                date: dateStr,
                price: cheapestFlight.price,
                flightData: cheapestFlight,
                status: 'success' as const,
                daysFromSearch
              };
            })
            .catch((error) => {
              console.error(`   ❌ ${dateStr} (${daysFromSearch > 0 ? '+' : ''}${daysFromSearch}d): ${error.message}`);
              return {
                date: dateStr,
                price: null,
                flightData: null,
                status: 'error' as const,
                daysFromSearch
              };
            });
          
          batchPromises.push(promise);
        }
        
        const batchResults = await Promise.all(batchPromises);
        priceData.push(...batchResults);
        
        if (batch < Math.ceil(totalDays / batchSize) - 1) {
          await sleep(2000);
        }
        
        console.log(`\n✅ Batch ${batch + 1}/${Math.ceil(totalDays / batchSize)} complete\n`);
      }

      const validPrices = priceData.filter(d => d.price !== null);
      const prices = validPrices.map(d => d.price!);
      
      const searchDateData = priceData.find(d => d.date === departDate);
      const searchDatePrice = searchDateData?.price || null;
      
      const stats = {
        lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
        highestPrice: prices.length > 0 ? Math.max(...prices) : null,
        averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
        bestDate: validPrices.length > 0 
          ? validPrices.reduce((min, d) => d.price! < min.price! ? d : min).date
          : null,
        searchDatePrice,
        potentialSavings: searchDatePrice && prices.length > 0 
          ? Math.max(0, searchDatePrice - Math.min(...prices))
          : null,
        daysBeforeBestPrice: null as number | null
      };

      if (stats.bestDate) {
        const bestDateObj = new Date(stats.bestDate);
        const daysDiff = Math.round((bestDateObj.getTime() - searchDate.getTime()) / (1000 * 60 * 60 * 24));
        stats.daysBeforeBestPrice = daysDiff;
      }

      const duration = Date.now() - startTime;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ 45-DAY PRICE CALENDAR COMPLETED - ALL REAL DATA`);
      console.log(`${'='.repeat(80)}`);
      console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
      console.log(`Valid Data Points: ${validPrices.length}/${totalDays}`);
      console.log(`Price Range: ₹${stats.lowestPrice} - ₹${stats.highestPrice}`);
      console.log(`Search Date (${departDate}): ₹${stats.searchDatePrice || 'N/A'}`);
      console.log(`Best Date: ${stats.bestDate} (₹${stats.lowestPrice})`);
      if (stats.potentialSavings && stats.potentialSavings > 0) {
        console.log(`Potential Savings: ₹${stats.potentialSavings} (${Math.round(stats.potentialSavings / (stats.searchDatePrice || 1) * 100)}%)`);
      }
      if (stats.daysBeforeBestPrice !== null) {
        const direction = stats.daysBeforeBestPrice < 0 ? 'before' : 'after';
        console.log(`Best price is ${Math.abs(stats.daysBeforeBestPrice)} days ${direction} your search date`);
      }
      console.log(`Data Source: Amadeus Production API`);
      console.log(`Mock Data: NONE - 100% Real Flights`);
      console.log(`${'='.repeat(80)}\n`);

      res.json({
        success: true,
        route: `${origin} → ${destination}`,
        searchDate: departDate,
        priceData,
        stats,
        meta: {
          source: 'amadeus_production',
          isMockData: false,
          dataQuality: 'real_time_validated',
          totalDays,
          validDataPoints: validPrices.length,
          duration,
          dateRange: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            searchDate: departDate
          },
          message: 'All prices fetched from Amadeus Production API - No mock data'
        }
      });

    } catch (error: any) {
      console.error('45-day price calendar error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to fetch 45-day price calendar data"
      });
    }
  });

  // ========================================
  // HEALTH CHECK
  // ========================================
  app.get("/api/health", (req: Request, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      features: {
        flightSearch: true,
        realtimeValidation: true,
        retryLogic: true,
        priceCalendar45Day: true,
        dateValidation: true
      },
      retryConfig: {
        enabled: true,
        maxAttempts: RETRY_CONFIG.maxAttempts,
        delayMs: RETRY_CONFIG.delayMs,
        retryableCodes: RETRY_CONFIG.retryableStatusCodes
      }
    });
  });

  app.post("/api/flights/price-calendar-45day", async (req: Request, res) => {
  const startTime = Date.now();
  
  try {
    const { origin, destination, departDate, passengers = 1 } = req.body;

    if (!origin || !destination || !departDate) {
      return res.status(400).json({ 
        message: "Missing required fields: origin, destination, and departDate" 
      });
    }

    // ============================================
    // REQUIRE AMADEUS CREDENTIALS - NO MOCK DATA
    // ============================================
    const apiKey = process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID;
    const apiSecret = process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.error('❌ AMADEUS CREDENTIALS MISSING FOR 45-DAY PRICE CALENDAR!');
      return res.status(500).json({
        success: false,
        error: 'Amadeus API credentials not configured',
        message: 'AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables are required'
      });
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 45-DAY PRICE CALENDAR REQUEST - REAL DATA ONLY`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Route: ${origin} → ${destination}`);
    console.log(`Search Date: ${departDate}`);
    console.log(`Date Range: 30 days before + 15 days after = 45 days total`);
    console.log(`API: Amadeus Production (NO MOCK DATA)`);
    console.log(`${'='.repeat(80)}\n`);

    // Parse the search date
    const searchDate = new Date(departDate);
    const priceData: Array<{
      date: string;
      price: number | null;
      flightData: any | null;
      status: 'success' | 'no_flights' | 'error';
      daysFromSearch: number;
    }> = [];

    // Calculate date range: -30 to +15 days from search date
    const startDate = new Date(searchDate);
    startDate.setDate(startDate.getDate() - 30);
    
    const endDate = new Date(searchDate);
    endDate.setDate(endDate.getDate() + 15);

    // Fetch prices for 45 days
    const totalDays = 45;
    const batchSize = 3; // Process 3 dates at a time to avoid rate limits
    
    console.log(`🔄 Starting to fetch REAL prices for ${totalDays} dates...`);
    console.log(`   From: ${startDate.toISOString().split('T')[0]}`);
    console.log(`   To: ${endDate.toISOString().split('T')[0]}`);
    console.log(`   Search Date: ${departDate}`);
    console.log(`⚠️  This will take ~${Math.ceil(totalDays / batchSize)} batches\n`);
    
    for (let batch = 0; batch < Math.ceil(totalDays / batchSize); batch++) {
      const batchPromises = [];
      
      for (let i = 0; i < batchSize; i++) {
        const dayIndex = batch * batchSize + i;
        if (dayIndex >= totalDays) break;
        
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + dayIndex);
        
        // Skip dates before yesterday (Amadeus doesn't allow past dates)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const daysFromSearch = Math.round((currentDate.getTime() - searchDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (currentDate < yesterday) {
          priceData.push({
            date: dateStr,
            price: null,
            flightData: null,
            status: 'error',
            daysFromSearch
          });
          continue;
        }
        
        // ============================================
        // REAL AMADEUS API CALL - NO MOCK FALLBACK
        // ============================================
        const promise = searchFlights({
          origin,
          destination,
          departDate: dateStr,
          passengers,
          maxResults: 20
        })
          .then((flights) => {
            if (flights.length === 0) {
              console.log(`   ⚠️  ${dateStr} (${daysFromSearch > 0 ? '+' : ''}${daysFromSearch}d): No flights`);
              return {
                date: dateStr,
                price: null,
                flightData: null,
                status: 'no_flights' as const,
                daysFromSearch
              };
            }
            
            // Find cheapest flight from REAL Amadeus data
            const cheapestFlight = flights.reduce((min, flight) => 
              flight.price < min.price ? flight : min
            );
            
            const marker = dateStr === departDate ? ' 🎯' : '';
            console.log(`   ✅ ${dateStr} (${daysFromSearch > 0 ? '+' : ''}${daysFromSearch}d): ₹${cheapestFlight.price}${marker}`);
            
            return {
              date: dateStr,
              price: cheapestFlight.price,
              flightData: cheapestFlight,
              status: 'success' as const,
              daysFromSearch
            };
          })
          .catch((error) => {
            console.error(`   ❌ ${dateStr} (${daysFromSearch > 0 ? '+' : ''}${daysFromSearch}d): ${error.message}`);
            return {
              date: dateStr,
              price: null,
              flightData: null,
              status: 'error' as const,
              daysFromSearch
            };
          });
        
        batchPromises.push(promise);
      }
      
      // Wait for this batch to complete
      const batchResults = await Promise.all(batchPromises);
      priceData.push(...batchResults);
      
      // Delay between batches to avoid rate limiting
      if (batch < Math.ceil(totalDays / batchSize) - 1) {
        await sleep(2000); // 2 second delay
      }
      
      console.log(`\n✅ Batch ${batch + 1}/${Math.ceil(totalDays / batchSize)} complete\n`);
    }

    // Filter and calculate statistics
    const validPrices = priceData.filter(d => d.price !== null);
    const prices = validPrices.map(d => d.price!);
    
    // Find search date price
    const searchDateData = priceData.find(d => d.date === departDate);
    const searchDatePrice = searchDateData?.price || null;
    
    const stats = {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
      highestPrice: prices.length > 0 ? Math.max(...prices) : null,
      averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      bestDate: validPrices.length > 0 
        ? validPrices.reduce((min, d) => d.price! < min.price! ? d : min).date
        : null,
      searchDatePrice,
      potentialSavings: searchDatePrice && prices.length > 0 
        ? Math.max(0, searchDatePrice - Math.min(...prices))
        : null,
      daysBeforeBestPrice: null as number | null
    };

    // Calculate days from search date to best price
    if (stats.bestDate) {
      const bestDateObj = new Date(stats.bestDate);
      const daysDiff = Math.round((bestDateObj.getTime() - searchDate.getTime()) / (1000 * 60 * 60 * 24));
      stats.daysBeforeBestPrice = daysDiff;
    }

    const duration = Date.now() - startTime;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ 45-DAY PRICE CALENDAR COMPLETED - ALL REAL DATA`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`Valid Data Points: ${validPrices.length}/${totalDays}`);
    console.log(`Price Range: ₹${stats.lowestPrice} - ₹${stats.highestPrice}`);
    console.log(`Search Date (${departDate}): ₹${stats.searchDatePrice || 'N/A'}`);
    console.log(`Best Date: ${stats.bestDate} (₹${stats.lowestPrice})`);
    if (stats.potentialSavings && stats.potentialSavings > 0) {
      console.log(`Potential Savings: ₹${stats.potentialSavings} (${Math.round(stats.potentialSavings / (stats.searchDatePrice || 1) * 100)}%)`);
    }
    if (stats.daysBeforeBestPrice !== null) {
      const direction = stats.daysBeforeBestPrice < 0 ? 'before' : 'after';
      console.log(`Best price is ${Math.abs(stats.daysBeforeBestPrice)} days ${direction} your search date`);
    }
    console.log(`Data Source: Amadeus Production API`);
    console.log(`Mock Data: NONE - 100% Real Flights`);
    console.log(`${'='.repeat(80)}\n`);

    res.json({
      success: true,
      route: `${origin} → ${destination}`,
      searchDate: departDate,
      priceData,
      stats,
      meta: {
        source: 'amadeus_production',
        isMockData: false,
        dataQuality: 'real_time_validated',
        totalDays,
        validDataPoints: validPrices.length,
        duration,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          searchDate: departDate
        },
        message: 'All prices fetched from Amadeus Production API - No mock data'
      }
    });

  } catch (error: any) {
    console.error('45-day price calendar error:', error);
    res.status(500).json({ 
      message: error.message || "Failed to fetch 45-day price calendar data"
    });
  }
});


  const httpServer = createServer(app);
  return httpServer;
}













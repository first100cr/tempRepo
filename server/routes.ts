// server/routes.ts
// OPTIMIZED VERSION - Stable, TypeSafe, and Fast

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { searchFlights } from "./services/amadeusService";

// Extend Express Request type for `req.user`
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

// -------------------------
// CONFIG & HELPERS
// -------------------------
const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 2000,
  retryableStatusCodes: [503, 502, 504, 429],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retryWithDelay<T>(
  fn: () => Promise<T>,
  attemptNumber = 1
): Promise<T> {
  try {
    const result = await fn();
    if (attemptNumber > 1) {
      console.log(`✅ Retry successful on attempt ${attemptNumber}`);
    }
    return result;
  } catch (error: any) {
    const status = error.status || error.statusCode || error.response?.status;
    const code = error.code;

    const shouldRetry =
      attemptNumber < RETRY_CONFIG.maxAttempts &&
      (RETRY_CONFIG.retryableStatusCodes.includes(status) ||
        ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].includes(code) ||
        /503|timeout/i.test(error.message));

    if (shouldRetry) {
      console.log(
        `⚠️ Attempt ${attemptNumber}/${RETRY_CONFIG.maxAttempts} failed (${status || code}), retrying in ${RETRY_CONFIG.delayMs}ms...`
      );
      await sleep(RETRY_CONFIG.delayMs);
      return retryWithDelay(fn, attemptNumber + 1);
    }

    console.error(`❌ Retry failed after ${attemptNumber} attempts`);
    throw error;
  }
}

// -------------------------
// TYPE DEFINITIONS
// -------------------------
type Flight = {
  price: number;
  isValidated?: boolean;
  [key: string]: any;
};

type PriceDataPoint = {
  date: string;
  price: number | null;
  flightData: Flight | null;
  status: "success" | "no_flights" | "error";
  daysFromSearch: number;
};

// -------------------------
// ROUTES REGISTRATION
// -------------------------
export function registerRoutes(app: Express): Server {
  // =================================================
  // ✈️ FLIGHT SEARCH (Primary Endpoint)
  // =================================================
  app.post("/api/flights/search", async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const {
        origin,
        destination,
        departDate,
        returnDate,
        passengers = 1,
        tripType = "round-trip",
      } = req.body;

      if (!origin || !destination || !departDate) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: origin, destination, departDate",
        });
      }

      console.log(`\n${"=".repeat(80)}`);
      console.log(`🔍 FLIGHT SEARCH: ${origin} → ${destination}`);
      console.log(`Date: ${departDate}${returnDate ? ` → ${returnDate}` : ""}`);
      console.log(`Passengers: ${passengers}`);
      console.log(`${"=".repeat(80)}\n`);

      const apiKey = process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID;
      const apiSecret = process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET;

      if (!apiKey || !apiSecret) {
        console.error("❌ Missing Amadeus credentials");
        return res.status(500).json({
          success: false,
          error: "Amadeus API credentials not configured",
        });
      }

      const passengersNum = Number(passengers) || 1;

      const flightData: Flight[] = await retryWithDelay(async () => {
        const results = await searchFlights({
          origin,
          destination,
          departDate,
          returnDate,
          passengers: passengersNum,
        });
        console.log(`✅ Amadeus returned ${results.length} flights`);
        return results;
      });

      const validationStats = {
        total: flightData.length,
        validated: flightData.filter((f: Flight) => f.isValidated).length,
        unvalidated: flightData.filter((f: Flight) => !f.isValidated).length,
      };

      res.json({
        success: true,
        data: flightData,
        searchParams: {
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          departDate,
          returnDate,
          passengers: passengersNum,
          tripType,
        },
        meta: {
          count: flightData.length,
          duration: Date.now() - startTime,
          validation: validationStats,
        },
      });
    } catch (error: unknown) {
      console.error("❌ SEARCH FAILED:", (error as Error).message);
      res.status(500).json({
        success: false,
        message: (error as Error).message || "Failed to search flights",
      });
    }
  });

  // =================================================
  // 📊  45-DAY PRICE CALENDAR
  // =================================================
  app.post("/api/flights/price-calendar-45day", async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { origin, destination, departDate, passengers = 1 } = req.body;

      if (!origin || !destination || !departDate) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: origin, destination, and departDate",
        });
      }

      const apiKey = process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID;
      const apiSecret = process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET;

      if (!apiKey || !apiSecret) {
        return res.status(500).json({
          success: false,
          error: "Amadeus API credentials not configured",
        });
      }

      const searchDate = new Date(`${departDate}T00:00:00`);
      const startDate = new Date(searchDate);
      startDate.setDate(startDate.getDate() - 30);

      const endDate = new Date(searchDate);
      endDate.setDate(endDate.getDate() + 15);

      const totalDays = 46;
      const batchSize = 8;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const priceData: PriceDataPoint[] = [];

      console.log(`\n📅 Fetching price calendar (-30 → +15 days)`);

      for (let batch = 0; batch < Math.ceil(totalDays / batchSize); batch++) {
        const batchPromises: Promise<PriceDataPoint>[] = [];

        for (let i = 0; i < batchSize; i++) {
          const dayIndex = batch * batchSize + i;
          if (dayIndex >= totalDays) break;

          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + dayIndex);

          const dateStr = currentDate.toISOString().split("T")[0];
          const daysFromSearch = Math.round(
            (currentDate.getTime() - searchDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (currentDate < yesterday) {
            priceData.push({
              date: dateStr,
              price: null,
              flightData: null,
              status: "error",
              daysFromSearch,
            });
            continue;
          }

          const promise = searchFlights({
            origin,
            destination,
            departDate: dateStr,
            passengers: Number(passengers) || 1,
            maxResults: 10,
          })
            .then((flights: Flight[]) => {
              if (flights.length === 0) {
                return {
                  date: dateStr,
                  price: null,
                  flightData: null,
                  status: "no_flights" as const,
                  daysFromSearch,
                };
              }

              const cheapest = flights.reduce<Flight>(
                (min, f) => (f.price < min.price ? f : min),
                flights[0]
              );

              return {
                date: dateStr,
                price: cheapest.price,
                flightData: cheapest,
                status: "success" as const,
                daysFromSearch,
              };
            })
            .catch((error: unknown) => {
              console.error(`❌ ${dateStr}:`, (error as Error).message);
              return {
                date: dateStr,
                price: null,
                flightData: null,
                status: "error" as const,
                daysFromSearch,
              };
            });

          batchPromises.push(promise);
        }

        const results = await Promise.all(batchPromises);
        priceData.push(...results);
        if (batch < Math.ceil(totalDays / batchSize) - 1) await sleep(500);
      }

      const valid = priceData.filter((p) => p.price !== null);
      const prices = valid.map((p) => p.price!);
      const best = valid.reduce((min, p) => (p.price! < min.price! ? p : min), valid[0]);

      const stats = {
        lowestPrice: prices.length ? Math.min(...prices) : null,
        highestPrice: prices.length ? Math.max(...prices) : null,
        averagePrice: prices.length
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : null,
        bestDate: best?.date || null,
      };

      res.json({
        success: true,
        route: `${origin} → ${destination}`,
        searchDate: departDate,
        priceData,
        stats,
        meta: {
          totalDays: priceData.length,
          validDataPoints: valid.length,
          duration: Date.now() - startTime,
          dateRange: {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
          },
        },
      });
    } catch (error: unknown) {
      console.error("❌ PRICE CALENDAR ERROR:", (error as Error).message);
      res.status(500).json({
        success: false,
        message: (error as Error).message || "Failed to fetch price calendar",
      });
    }
  });

  // =================================================
  // ✅ FINALIZE SERVER
  // =================================================
  return createServer(app);
}

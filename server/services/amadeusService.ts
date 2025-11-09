import Amadeus from 'amadeus';

const hostname = process.env.AMADEUS_HOSTNAME || 'production';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET || '',
  hostname: hostname as 'production' | 'test'
});

console.log('🔧 Amadeus:', hostname === 'production' ? '🚀 PRODUCTION' : '🧪 TEST');

const AIRLINE_DATABASE: Record<string, string> = {
  'AI': 'Air India', '6E': 'IndiGo', 'SG': 'SpiceJet', 'UK': 'Vistara',
  'G8': 'Go First', 'I5': 'AirAsia India', 'QP': 'Akasa Air', '9W': 'Jet Airways',
  'EK': 'Emirates', 'QR': 'Qatar Airways', 'EY': 'Etihad Airways',
  'FZ': 'flydubai', 'WY': 'Oman Air', 'BA': 'British Airways',
  'LH': 'Lufthansa', 'AF': 'Air France', 'KL': 'KLM', 'TK': 'Turkish Airlines',
  'SQ': 'Singapore Airlines', 'TG': 'Thai Airways', 'CX': 'Cathay Pacific',
  'JL': 'Japan Airlines', 'NH': 'ANA', 'MH': 'Malaysia Airlines',
  'DL': 'Delta Air Lines', 'AA': 'American Airlines', 'UA': 'United Airlines',
  'AC': 'Air Canada', 'IX': 'Air India Express' // Added IX for Air India Express
};

// ✅ FIXED: Case-insensitive airline lookup
function getAirlineName(code: string, dictionaries?: any): string {
  if (!code) return 'Unknown';
  
  const upperCode = code.toUpperCase(); // Ensure uppercase
  
  // Try dictionaries first (case-insensitive)
  if (dictionaries?.carriers) {
    // Check exact match
    if (dictionaries.carriers[upperCode]) {
      return dictionaries.carriers[upperCode];
    }
    // Check case-insensitive match
    const carrierKeys = Object.keys(dictionaries.carriers);
    const matchingKey = carrierKeys.find(k => k.toUpperCase() === upperCode);
    if (matchingKey) {
      return dictionaries.carriers[matchingKey];
    }
  }
  
  // Fallback to our database
  if (AIRLINE_DATABASE[upperCode]) {
    return AIRLINE_DATABASE[upperCode];
  }
  
  // Last resort: return the code itself
  console.warn(`⚠️ Unknown airline code: ${code}`);
  return upperCode;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  maxResults?: number;
}

interface FlightOffer {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  aircraft: string;
  baggage?: string;
  bookingUrl: string;
  cabinClass: string;
  availableSeats?: number;
  segments: any[];
  numberOfBookableSeats?: number;
  validatingAirlineCodes?: string[];
  isValidated?: boolean;
  priceLastUpdated?: string;
}

// Global variable to store last search details for diagnostic endpoint
export let lastSearchDiagnostics: any = null;

async function verifyFlightPriceAndAvailability(offer: any): Promise<{ price: number, seatsAvailable: boolean }> {
  try {
    // Serialize offer object to JSON string
    const response = await amadeus.shopping.flightOffers.pricing.post(JSON.stringify(offer));
    const result = response.data;

    if (result) {
      const flightPrice = Math.round(parseFloat(result.price?.grandTotal || result.price?.total || '0'));
      const seats = result.numberOfBookableSeats ?? 0;
      return { price: flightPrice, seatsAvailable: seats > 0 };
    }
    return { price: 0, seatsAvailable: false };
  } catch (error: any) {
    console.warn('⚠️ Amadeus flight price verification failed:', error.message);
    return { price: 0, seatsAvailable: false };
  }
}


export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const searchStartTime = Date.now();
  
  try {
    const { origin, destination, departDate, returnDate, passengers, maxResults = 50 } = params;

    if (!origin || !destination || !departDate) {
      throw new Error('Missing required parameters');
    }

    const searchParams = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: departDate,
      adults: passengers.toString(),
      max: maxResults.toString(),
      currencyCode: 'INR',
      ...(returnDate && { returnDate })
    };

    console.log('\n' + '🔥'.repeat(60));
    console.log('🔥 SEARCH:', origin, '→', destination, 'on', departDate);
    console.log('🔥'.repeat(60) + '\n');

    // CALL AMADEUS API
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    const rawFlightOffers = response.data;
    
    // ✅ FIXED: Correct path for dictionaries (was response.result.dictionaries)
    const dictionaries = (response as any).dictionaries;
    
    console.log('📡 RAW AMADEUS RESPONSE:', rawFlightOffers?.length || 0, 'offers\n');
    console.log('📚 DICTIONARIES:', dictionaries ? '✅ Found' : '❌ NOT FOUND');
    
    if (dictionaries?.carriers) {
      const carrierCodes = Object.keys(dictionaries.carriers);
      console.log(`   📋 Carriers in Amadeus dict: ${carrierCodes.length} airlines`);
      console.log(`   📋 Sample: ${carrierCodes.slice(0, 10).join(', ')}\n`);
    } else {
      console.log('   ⚠️ No carrier dictionaries - will use fallback database\n');
    }

    if (!rawFlightOffers || rawFlightOffers.length === 0) {
      console.warn('⚠️ AMADEUS RETURNED ZERO FLIGHTS\n');
      lastSearchDiagnostics = {
        route: `${origin} → ${destination}`,
        date: departDate,
        amadeusReturned: 0,
        airlines: [],
        finalResult: 0,
        message: 'Amadeus returned no flights for this route/date'
      };
      return [];
    }

    // COUNT AIRLINES IN RAW RESPONSE
    const airlinesMap = new Map<string, number>();
    rawFlightOffers.forEach((offer: any) => {
      const code = offer.itineraries?.[0]?.segments?.[0]?.carrierCode;
      if (code) {
        const upperCode = code.toUpperCase();
        airlinesMap.set(upperCode, (airlinesMap.get(upperCode) || 0) + 1);
      }
    });

    console.log('✈️ AIRLINES IN AMADEUS RAW RESPONSE:');
    const airlinesList: string[] = [];
    airlinesMap.forEach((count, code) => {
      const name = getAirlineName(code, dictionaries);
      console.log(`   ${code}: ${name} - ${count} flight${count > 1 ? 's' : ''}`);
      airlinesList.push(`${name} (${code})`);
    });
    console.log('');

    // TRANSFORM ALL FLIGHTS - ZERO FILTERING
    
    console.log('🔄 TRANSFORMING ALL', rawFlightOffers.length, 'FLIGHTS (NO FILTERING)...\n');
    
    const transformedFlights: FlightOffer[] = [];
    const transformErrors: Array<{index: number, code: string, error: string}> = [];
    
    for (let i = 0; i < rawFlightOffers.length; i++) {
      const offer = rawFlightOffers[i];
      try {
        // Verify price & availability before transformation
        const { price, seatsAvailable } = await verifyFlightPriceAndAvailability(offer);

        if (!seatsAvailable || price <= 0) {
          transformErrors.push({
            index: i + 1,
            code: offer.itineraries?.[0]?.segments?.[0]?.carrierCode || 'UNKNOWN',
            error: 'Flight not available or invalid price after verification'
          });
          continue;
        }

        // Override offer price with verified price
        offer.price.grandTotal = price.toString();

        const transformed = transformFlight(offer, dictionaries);
        
        if (transformed) {
          transformedFlights.push(transformed);
        } else {
          const code = offer.itineraries?.[0]?.segments?.[0]?.carrierCode || 'UNKNOWN';
          transformErrors.push({
            index: i + 1,
            code,
            error: 'Transform returned null'
          });
        }
      } catch (error: any) {
        const code = offer.itineraries?.[0]?.segments?.[0]?.carrierCode || 'UNKNOWN';
        transformErrors.push({
          index: i + 1,
          code,
          error: error.message || 'Unknown error'
        });
      }
    }

    console.log(`✅ Successfully transformed: ${transformedFlights.length}/${rawFlightOffers.length}\n`);
    
    if (transformErrors.length > 0) {
      console.log(`❌ TRANSFORM ERRORS (${transformErrors.length}):`);
      transformErrors.forEach(err => {
        console.log(`   Flight ${err.index} (${err.code}): ${err.error}`);
      });
      console.log('');
    }

    // DEDUPLICATION
    const uniqueFlights: FlightOffer[] = [];
    const seen = new Set<string>();
    
    for (const flight of transformedFlights) {
      const key = `${flight.flightNumber}_${flight.departTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFlights.push(flight);
      }
    }

    uniqueFlights.sort((a, b) => a.price - b.price);

    // COUNT AIRLINES IN FINAL RESULT
    const finalAirlinesMap = new Map<string, number>();
    uniqueFlights.forEach(flight => {
      const code = flight.flightNumber.split(' ')[0].toUpperCase();
      finalAirlinesMap.set(code, (finalAirlinesMap.get(code) || 0) + 1);
    });

    console.log('📊 FINAL RESULTS:');
    console.log('   Total flights:', uniqueFlights.length);
    console.log('   Unique airlines:', finalAirlinesMap.size);
    console.log('\n✈️ AIRLINES IN FINAL RESULT:');
    finalAirlinesMap.forEach((count, code) => {
      const name = getAirlineName(code, dictionaries);
      console.log(`   ${code}: ${name} - ${count} flight${count > 1 ? 's' : ''}`);
    });
    console.log('');

    // STORE DIAGNOSTICS
    lastSearchDiagnostics = {
      route: `${origin} → ${destination}`,
      date: departDate,
      searchDurationMs: Date.now() - searchStartTime,
      amadeus: {
        totalOffers: rawFlightOffers.length,
        airlines: Array.from(airlinesMap.keys()),
        airlinesCount: airlinesMap.size,
        airlineBreakdown: Object.fromEntries(
          Array.from(airlinesMap.entries()).map(([code, count]) => [
            `${code} (${getAirlineName(code, dictionaries)})`,
            count
          ])
        ),
        hadDictionaries: !!dictionaries?.carriers
      },
      transformation: {
        successful: transformedFlights.length,
        failed: transformErrors.length,
        errors: transformErrors
      },
      final: {
        totalFlights: uniqueFlights.length,
        airlines: Array.from(finalAirlinesMap.keys()),
        airlinesCount: finalAirlinesMap.size,
        airlineBreakdown: Object.fromEntries(
          Array.from(finalAirlinesMap.entries()).map(([code, count]) => [
            `${code} (${getAirlineName(code, dictionaries)})`,
            count
          ])
        )
      },
      summary: airlinesMap.size === 1 
        ? `Amadeus only returned ${Array.from(airlinesMap.keys())[0]} for this route/date`
        : `Amadeus returned ${airlinesMap.size} airlines`
    };

    // CRITICAL DIAGNOSTIC
    if (airlinesMap.size > 1 && finalAirlinesMap.size === 1) {
      console.log('🚨 BUG DETECTED: Airlines were lost during transformation!');
      console.log('   Amadeus returned:', Array.from(airlinesMap.keys()).join(', '));
      console.log('   Final result has:', Array.from(finalAirlinesMap.keys()).join(', '));
      console.log('   Check transform errors above ^\n');
    } else if (airlinesMap.size === 1) {
      const onlyAirline = getAirlineName(Array.from(airlinesMap.keys())[0], dictionaries);
      console.log(`ℹ️ Amadeus only has ${onlyAirline} for ${origin}→${destination} on ${departDate}`);
      console.log('   This is what Amadeus returned - not a code issue.');
      console.log('   Try: Different dates or major routes (DEL→BOM)\n');
    } else {
      console.log(`✅ SUCCESS: All ${finalAirlinesMap.size} airlines preserved!\n`);
    }

    console.log('🔥'.repeat(60) + '\n');

    return uniqueFlights;

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Status:', error.response?.statusCode);
    console.error('Details:', error.response?.body);
    
    lastSearchDiagnostics = {
      error: error.message,
      details: error.response?.body
    };
    
    throw error;
  }
}

function transformFlight(offer: any, dictionaries?: any): FlightOffer | null {
  try {
    if (!offer?.itineraries?.[0]?.segments?.[0]) {
      return null;
    }

    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    
    const airlineCode = (firstSegment.carrierCode || 'XX').toUpperCase(); // ✅ Ensure uppercase
    const airlineName = getAirlineName(airlineCode, dictionaries); // ✅ Use helper function
    
    const price = Math.round(parseFloat(offer.price?.grandTotal || offer.price?.total || '0'));
    if (price <= 0) {
      console.warn(`⚠️ Invalid price for ${airlineCode} flight: ${price}`);
      return null;
    }

    // ✅ Get aircraft name (case-insensitive)
    const aircraftCode = firstSegment.aircraft?.code?.toUpperCase();
    const aircraftName = dictionaries?.aircraft?.[aircraftCode] 
      || dictionaries?.aircraft?.[firstSegment.aircraft?.code]
      || 'Aircraft';
    
    return {
      id: offer.id || `flight-${Date.now()}`,
      airline: airlineName,
      airlineLogo: `https://images.kiwi.com/airlines/64/${airlineCode}.png`,
      flightNumber: `${airlineCode} ${firstSegment.number || '0000'}`,
      origin: firstSegment.departure?.iataCode || 'XXX',
      destination: lastSegment.arrival?.iataCode || 'XXX',
      departTime: formatTime(firstSegment.departure?.at),
      arriveTime: formatTime(lastSegment.arrival?.at),
      departDate: formatDate(firstSegment.departure?.at),
      arriveDate: formatDate(lastSegment.arrival?.at),
      duration: formatDuration(itinerary.duration),
      stops: itinerary.segments.length - 1,
      price,
      currency: offer.price?.currency || 'INR',
      aircraft: aircraftName,
      baggage: getBaggageInfo(offer.travelerPricings?.[0]),
      bookingUrl: generateAffiliateLink(offer, { passengers: offer?.travelerPricings?.length }) || "",
      cabinClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      availableSeats: offer.numberOfBookableSeats || 9,
      segments: itinerary.segments.map((seg: any) => ({
        departure: { iataCode: seg.departure?.iataCode, terminal: seg.departure?.terminal, at: seg.departure?.at },
        arrival: { iataCode: seg.arrival?.iataCode, terminal: seg.arrival?.terminal, at: seg.arrival?.at },
        carrierCode: seg.carrierCode, 
        number: seg.number,
        aircraft: { code: seg.aircraft?.code },
        duration: formatDuration(seg.duration),
        operatingCarrierCode: seg.operating?.carrierCode
      })),
      numberOfBookableSeats: offer.numberOfBookableSeats,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      isValidated: false,
      priceLastUpdated: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('❌ Transform error:', error.message);
    return null;
  }
}

export async function searchAirports(keyword: string): Promise<any[]> {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: 'AIRPORT,CITY'
    });
    return response.data || [];
  } catch (error: any) {
    throw new Error(`Airport search failed: ${error.message}`);
  }
}

export async function getAirportByCode(iataCode: string): Promise<any> {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: iataCode,
      subType: 'AIRPORT'
    });
    return response.data?.[0];
  } catch (error: any) {
    throw new Error(`Failed to get airport: ${error.message}`);
  }
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return '00:00'; }
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return 'Unknown'; }
}

function formatDuration(duration: string): string {
  try {
    const hours = duration.match(/(\d+)H/)?.[1];
    const minutes = duration.match(/(\d+)M/)?.[1];
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    if (minutes) return `${minutes}m`;
    return duration.replace('PT', '');
  } catch { return 'Unknown'; }
}

function getBaggageInfo(travelerPricing: any): string {
  try {
    const baggageInfo = travelerPricing?.fareDetailsBySegment?.[0]?.includedCheckedBags;
    if (!baggageInfo) return '15 KG';
    if (baggageInfo.quantity) return `${baggageInfo.quantity} piece${baggageInfo.quantity > 1 ? 's' : ''}`;
    if (baggageInfo.weight) return `${baggageInfo.weight} ${baggageInfo.weightUnit || 'KG'}`;
    return '15 KG';
  } catch { return '15 KG'; }
}

function generateAffiliateLink(offer: any, searchParams?: { passengers?: number }): string {
  const publisherId = process.env.EXPEDIA_AFFILIATE_ID ?? 'YOUR_FALLBACK_PUBLISHER_ID';
  const baseUrl = "https://www.expedia.com/Flights-Search";

  const origin = offer.itineraries[0].segments[0].departure.iataCode;
  const destination = offer.itineraries[0].segments.slice(-1)[0].arrival.iataCode;
  const departureDate = offer.itineraries[0].segments[0].departure.at.split('T')[0];
  const airline = offer.itineraries[0].segments[0].carrierCode;
  const flightNumber = offer.itineraries[0].segments[0].number;
  const passengers = searchParams?.passengers ?? offer.travelerPricings?.length ?? 1;

  // Cabin class fallback
  const cabinClass =
    offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin?.toLowerCase() || 'economy';

  return `${baseUrl}?trip=oneway` +
    `&leg1=from:${origin},to:${destination},departure:${departureDate}TANYT` +
    `&airline=${airline}` +
    `&flightNumber=${flightNumber}` +
    `&passengers=adults:${passengers}` +
    `&options=cabinclass:${cabinClass}` +
    `&mode=search&adref=${publisherId}`;
}

export async function testAmadeusConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing Amadeus...');
    const response = await amadeus.referenceData.locations.get({ keyword: 'DEL', subType: 'AIRPORT' });
    console.log('✅ Connected');
    return true;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

export default { searchFlights, searchAirports, getAirportByCode, testAmadeusConnection };

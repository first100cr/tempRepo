// server/services/amadeusService.ts
// ✅ UPDATED VERSION — Fixes "Price validation failed: undefined" & improves error logging

import Amadeus from 'amadeus';
import type { FlightOffer as AmadeusFlightOffer } from 'amadeus';

const hostname = process.env.AMADEUS_HOSTNAME || 'production';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET || '',
  hostname: hostname as 'production' | 'test'
});

console.log('🔧 Amadeus:', hostname === 'production' ? '🚀 PRODUCTION' : '🧪 TEST');

// -------------------------------
// Airline database (fallback)
// -------------------------------
const AIRLINE_DATABASE: Record<string, string> = {
  'AI': 'Air India', '6E': 'IndiGo', 'SG': 'SpiceJet', 'UK': 'Vistara',
  'G8': 'Go First', 'I5': 'AirAsia India', 'QP': 'Akasa Air', '9W': 'Jet Airways',
  'EK': 'Emirates', 'QR': 'Qatar Airways', 'EY': 'Etihad Airways',
  'FZ': 'flydubai', 'WY': 'Oman Air', 'BA': 'British Airways',
  'LH': 'Lufthansa', 'AF': 'Air France', 'KL': 'KLM', 'TK': 'Turkish Airlines',
  'SQ': 'Singapore Airlines', 'TG': 'Thai Airways', 'CX': 'Cathay Pacific',
  'JL': 'Japan Airlines', 'NH': 'ANA', 'MH': 'Malaysia Airlines',
  'DL': 'Delta Air Lines', 'AA': 'American Airlines', 'UA': 'United Airlines',
  'AC': 'Air Canada', 'IX': 'Air India Express'
};

function getAirlineName(code: string, dictionaries?: any): string {
  if (!code) return 'Unknown';
  const upper = code.toUpperCase();
  if (dictionaries?.carriers?.[upper]) return dictionaries.carriers[upper];
  if (AIRLINE_DATABASE[upper]) return AIRLINE_DATABASE[upper];
  return upper;
}

// -------------------------------
// Interfaces
// -------------------------------
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

// -------------------------------
// Global diagnostic cache
// -------------------------------
export let lastSearchDiagnostics: any = null;

// -------------------------------
// ✅ MAIN FUNCTION
// -------------------------------
export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const searchStartTime = Date.now();

  try {
    const { origin, destination, departDate, returnDate, passengers, maxResults = 50 } = params;

    const searchParams = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: departDate,
      adults: passengers.toString(),
      max: maxResults.toString(),
      currencyCode: 'INR',
      ...(returnDate && { returnDate })
    };

    console.log(`\n🔥 Searching flights: ${origin} → ${destination} on ${departDate}\n`);

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    const rawOffers = response.data || [];
    const dictionaries = (response as any).dictionaries;

    console.log(`📡 Amadeus returned ${rawOffers.length} offers\n`);

    if (!rawOffers.length) return [];

    const transformed = rawOffers.map((offer: any) => transformFlight(offer, dictionaries)).filter(Boolean) as FlightOffer[];
    transformed.sort((a, b) => a.price - b.price);

    console.log(`✅ Transformed ${transformed.length} flight offers`);

    // 🧩 STEP 2: Validate top 10 cheapest flights (price consistency check)
    const offersToValidate = rawOffers.slice(0, 10);
    let validatedOffers: any[] = [];

    if (offersToValidate.length) {
      try {
        console.log(`🔍 Validating top ${offersToValidate.length} flight offers with Amadeus Pricing API...`);

        // 🧠 FIX: Use correct API signature and log full response
        const validationResponse = await amadeus.shopping.flightOffers.pricing.post(
          JSON.stringify({
            data: {
              type: 'flight-offers-pricing',
              flightOffers: offersToValidate
            }
          })
        );

        // 🧠 FIX: Some responses return an object instead of array
        validatedOffers = Array.isArray(validationResponse.data)
          ? validationResponse.data
          : [validationResponse.data].filter(Boolean);

        console.log(`✅ Received ${validatedOffers.length} validated offers`);
      } catch (validationError: any) {
        console.warn('⚠️ Price validation failed:');
        console.error(validationError.response?.data || validationError.message);
      }
    }

    // 🧾 STEP 3: Update prices in transformed list
    if (validatedOffers.length) {
      const validatedMap = new Map(
        validatedOffers.map((v: any) => [v.id, parseFloat(v.price?.grandTotal ?? v.price?.total ?? '0')])
      );

      for (const flight of transformed) {
        const newPrice = validatedMap.get(flight.id);
        if (newPrice) {
          flight.price = Math.round(newPrice);
          flight.isValidated = true;
          flight.priceLastUpdated = new Date().toISOString();
        }
      }
    }

    lastSearchDiagnostics = {
      route: `${origin}→${destination}`,
      date: departDate,
      searchDurationMs: Date.now() - searchStartTime,
      offersReturned: rawOffers.length,
      validatedOffers: validatedOffers.length
    };

    console.log(`🏁 Final flight list: ${transformed.length} flights`);
    console.log('🔥'.repeat(50));

    return transformed;
  } catch (error: any) {
    console.error('❌ searchFlights error:', error.response?.data || error.message);
    throw error;
  }
}

// -------------------------------
// 🧩 Helper functions
// -------------------------------
function transformFlight(offer: any, dictionaries?: any): FlightOffer | null {
  try {
    const itinerary = offer.itineraries?.[0];
    if (!itinerary?.segments?.length) return null;

    const first = itinerary.segments[0];
    const last = itinerary.segments[itinerary.segments.length - 1];
    const airlineCode = first.carrierCode?.toUpperCase() || 'XX';

    const price = Math.round(parseFloat(offer.price?.grandTotal || offer.price?.total || '0'));
    if (!price) return null;

    const aircraftCode = first.aircraft?.code?.toUpperCase();
    const aircraftName = dictionaries?.aircraft?.[aircraftCode] || 'Aircraft';

    return {
      id: offer.id || `flt-${Date.now()}`,
      airline: getAirlineName(airlineCode, dictionaries),
      airlineLogo: `https://images.kiwi.com/airlines/64/${airlineCode}.png`,
      flightNumber: `${airlineCode} ${first.number}`,
      origin: first.departure?.iataCode,
      destination: last.arrival?.iataCode,
      departTime: formatTime(first.departure?.at),
      arriveTime: formatTime(last.arrival?.at),
      departDate: formatDate(first.departure?.at),
      arriveDate: formatDate(last.arrival?.at),
      duration: formatDuration(itinerary.duration),
      stops: itinerary.segments.length - 1,
      price,
      currency: offer.price?.currency || 'INR',
      aircraft: aircraftName,
      baggage: getBaggageInfo(offer.travelerPricings?.[0]),
      bookingUrl: generateAffiliateLink(offer),
      cabinClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      availableSeats: offer.numberOfBookableSeats || 9,
      segments: itinerary.segments,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      isValidated: false,
      priceLastUpdated: new Date().toISOString()
    };
  } catch (e: any) {
    console.warn('transformFlight failed:', e.message);
    return null;
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDuration(duration: string): string {
  const h = duration.match(/(\d+)H/)?.[1];
  const m = duration.match(/(\d+)M/)?.[1];
  return [h ? `${h}h` : '', m ? ` ${m}m` : ''].join('').trim();
}
function getBaggageInfo(tp: any): string {
  const b = tp?.fareDetailsBySegment?.[0]?.includedCheckedBags;
  if (b?.quantity) return `${b.quantity} pcs`;
  if (b?.weight) return `${b.weight}${b.weightUnit || 'KG'}`;
  return '15 KG';
}

function generateAffiliateLink(offer: AmadeusFlightOffer): string {
  const publisherId = process.env.EXPEDIA_AFFILIATE_ID ?? 'YOUR_FALLBACK_PUBLISHER_ID';
  const base = 'https://www.expedia.com/Flights-Search';

  const firstSegment = offer.itineraries?.[0]?.segments?.[0];
  const lastSegment = offer.itineraries?.[0]?.segments?.slice(-1)[0];

  if (!firstSegment || !lastSegment) {
    console.warn('⚠️ Missing segment data in offer:', offer.id);
    return base;
  }

  const origin = firstSegment.departure?.iataCode ?? '';
  const destination = lastSegment.arrival?.iataCode ?? '';
  const departureDate = (firstSegment.departure?.at ?? '').split('T')[0];

  return `${base}?trip=oneway&leg1=from:${origin},to:${destination},departure:${departureDate}TANYT&passengers=adults:1&options=cabinclass:economy&mode=search&partnerref=${publisherId}`;
}

// -------------------------------
// Airport search helpers
// -------------------------------
export async function searchAirports(keyword: string): Promise<any[]> {
  const response = await amadeus.referenceData.locations.get({ keyword, subType: 'AIRPORT,CITY' });
  return response.data || [];
}

export async function getAirportByCode(iataCode: string): Promise<any> {
  const response = await amadeus.referenceData.locations.get({ keyword: iataCode, subType: 'AIRPORT' });
  return response.data?.[0];
}

export async function testAmadeusConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing Amadeus...');
    await amadeus.referenceData.locations.get({ keyword: 'DEL', subType: 'AIRPORT' });
    console.log('✅ Amadeus connected');
    return true;
  } catch (e: any) {
    console.error('❌ Connection failed:', e.message);
    return false;
  }
}

export default { searchFlights, searchAirports, getAirportByCode, testAmadeusConnection };

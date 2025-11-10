// server/services/amadeusService.ts
// Flight search with internal repricing (Amadeus) + Expedia redirect links

import Amadeus from "amadeus";

export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers?: number;
  maxResults?: number;
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  bookingUrl: string;
  isValidated: boolean;
  priceLastUpdated: string;
}

const HOSTNAME = (process.env.AMADEUS_HOSTNAME as "production" | "test") || "production";
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || "INR";
const CONCURRENCY = Number(process.env.PRICE_CONCURRENCY || 6);
const PRICE_TIMEOUT_MS = Number(process.env.PRICE_TIMEOUT_MS || 6000);

console.log(`🔧 Amadeus Mode: ${HOSTNAME === "production" ? "🚀 PRODUCTION" : "🧪 TEST"}`);

const AMADEUS = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY || process.env.AMADEUS_CLIENT_ID || "",
  clientSecret: process.env.AMADEUS_API_SECRET || process.env.AMADEUS_CLIENT_SECRET || "",
  hostname: HOSTNAME,
});

// Airline name fallback database
const AIRLINE_NAMES: Record<string, string> = {
  AI: "Air India",
  SG: "SpiceJet",
  "6E": "IndiGo",
  UK: "Vistara",
  QP: "Akasa Air",
  IX: "Air India Express",
};

async function withTimeout<T>(p: Promise<T>, ms = PRICE_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("Pricing timeout")), ms)),
  ]);
}

function extractPrice(o: any): number {
  const raw = o?.price?.grandTotal ?? o?.price?.total ?? "0";
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function getAirline(code: string, dict?: Record<string, any>): string {
  return dict?.carriers?.[code] || AIRLINE_NAMES[code] || code;
}

function generateExpediaLink(offer: any, pax: number) {
  const segments = offer.itineraries[0].segments;

  const from = segments[0].departure.iataCode;
  const to = segments[segments.length - 1].arrival.iataCode;
  const date = segments[0].departure.at.split("T")[0];

 //cnst airline = segments[0].carrierCode;            // Example: "AI"
  const nonstop = segments.length === 1;              // true / false
  const departureTime = segments[0].departure.at.split("T")[1].substring(0, 5); // "HH:mm"

  const adref = process.env.EXPEDIA_AFFILIATE_ID ?? "YOUR_FALLBACK_PUBLISHER_ID";

  // Convert HH:mm → morning/afternoon/evening/night
  function mapToTimeWindow(time: string) {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  const timeWindow = mapToTimeWindow(departureTime);

  return (
    `https://www.expedia.co.in/Flights-Search?trip=oneway` +
    `&leg1=from:${from},to:${to},departure:${date}TANYT` +
    `&passengers=adults:${pax}` +                          
    (nonstop ? `&nonstop=yes&maxStops=0` : ``) +           // Filter based on stops → duration
    `&departureTime=${timeWindow}` +                       // Filter departure window
    `&cabinclass=economy` +                                // Optional: change if needed
    `&sort=price_a` +                                      // Sort by lowest price
    `&mode=search&adref=${adref}`
  );
}


// ✅ Correct repricing for production mode
async function priceOffer(offer: any) {
  const body = JSON.stringify({
    data: {
      type: "flight-offers-pricing",
      flightOffers: [offer],
    },
  });

  const resp = await withTimeout(
    AMADEUS.shopping.flightOffers.pricing.post(body),
    PRICE_TIMEOUT_MS
  );

  const pricedRoot = (resp as any).data;
  const priced = pricedRoot?.flightOffers?.[0];
  if (!priced) throw new Error("No repriced offer returned");

  const finalPrice = extractPrice(priced);
  return { priced, finalPrice };
}

export async function searchFlights({
  origin,
  destination,
  departDate,
  returnDate,
  passengers = 1,
  maxResults = 60,
}: SearchParams): Promise<FlightResult[]> {

  // ✅ FIX — this was `departureDate` before, now correct:
  const resp = await AMADEUS.shopping.flightOffersSearch.get({
    originLocationCode: origin.toUpperCase(),
    destinationLocationCode: destination.toUpperCase(),
    departureDate: departDate,              // ✅ FIXED
    ...(returnDate ? { returnDate } : {}),
    adults: String(passengers),
    max: String(maxResults),
    currencyCode: DEFAULT_CURRENCY,
  });

  const dict = (resp as any).dictionaries;
  const offers: any[] = (resp as any).data || [];

  if (!offers.length) return [];

  offers.sort((a, b) => extractPrice(a) - extractPrice(b));

  const results: FlightResult[] = [];
  let index = 0;

  async function worker() {
    while (index < offers.length) {
      const offer = offers[index++];
      try {
        const { priced, finalPrice } = await priceOffer(offer);

        if (finalPrice > 0) {
          const segs = offer.itineraries[0].segments;
          results.push({
            id: offer.id,
            airline: getAirline(segs[0].carrierCode, dict),
            flightNumber: `${segs[0].carrierCode} ${segs[0].number}`,
            origin: segs[0].departure.iataCode,
            destination: segs[segs.length - 1].arrival.iataCode,
            departTime: segs[0].departure.at,
            arriveTime: segs[segs.length - 1].arrival.at,
            duration: offer.itineraries[0].duration,
            stops: segs.length - 1,
            price: finalPrice,
            currency: priced.price.currency ?? DEFAULT_CURRENCY,
            bookingUrl: generateExpediaLink(offer, passengers),
            isValidated: true,
            priceLastUpdated: new Date().toISOString(),
          });
        }
      } catch {
        // ignore failures
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results.sort((a, b) => a.price - b.price);
}

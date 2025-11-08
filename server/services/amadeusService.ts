// server/services/amadeusService.ts
import Amadeus from 'amadeus';
import * as dotenv from 'dotenv';
dotenv.config();

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }[];
  }[];
}

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_HOST === 'production' ? 'production' : 'test',
});

// ----------------------------
// Expedia affiliate generator
// ----------------------------
function generateExpediaLink(from: string, to: string, departureDate: string, adults = 1): string {
  const date = new Date(departureDate);
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:${from},to:${to},departure:${formatted}TANYT&passengers=adults:${adults}&mode=search&adref=1011l416900`;
}

// ----------------------------
// Price Validation
// ----------------------------
async function validateFlightPrice(offer: FlightOffer): Promise<FlightOffer | null> {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post({
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [offer],
      },
    });

    const validatedOffer: any =
      (response.data?.data?.flightOffers?.[0] ||
        (Array.isArray(response.data) && response.data[0])) ??
      null;

    if (!validatedOffer?.price?.total) {
      console.warn('⚠️ Price validation failed: No price returned');
      return null;
    }

    const validatedPrice = validatedOffer.price.total;
    if (validatedPrice !== offer.price.total) {
      console.log(
        `💰 Price changed for offer ${offer.id}: ${offer.price.total} → ${validatedPrice}`
      );
    }

    return validatedOffer;
  } catch (error: any) {
    console.warn('⚠️ Price validation failed:', error?.message || error);
    return null;
  }
}

// ----------------------------
// Flight Search (Main Export)
// ----------------------------
export async function searchFlights(params: any) {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults = '1',
    children,
    infants,
    travelClass,
    currencyCode = 'INR',
    nonStop,
    max = '50',
  } = params;

  console.log(`🔍 Searching flights: ${originLocationCode} → ${destinationLocationCode}`);

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      currencyCode,
      nonStop,
      max,
    });

    const offers: FlightOffer[] = Array.isArray(response.data) ? response.data : [];

    // Transform offers for UI
    const transformed = offers.map((offer) => {
      const firstItinerary = offer.itineraries[0];
      const firstSegment = firstItinerary?.segments[0];
      const lastSegment = firstItinerary?.segments[firstItinerary.segments.length - 1];

      return {
        id: offer.id,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        origin: firstSegment?.departure?.iataCode || '',
        destination: lastSegment?.arrival?.iataCode || '',
        itineraries: offer.itineraries,
        affiliateUrl: generateExpediaLink(
          firstSegment?.departure?.iataCode || '',
          lastSegment?.arrival?.iataCode || '',
          departureDate,
          Number(adults)
        ),
      };
    });

    // Validate first 5 offers
    const sample = offers.slice(0, 5);
    for (const offer of sample) {
      await validateFlightPrice(offer);
    }

    return { success: true, data: transformed };
  } catch (error: any) {
    console.error('❌ searchFlights error:', error?.response?.data || error?.message || error);
    return { success: false, error: error?.message || 'Flight search failed' };
  }
}

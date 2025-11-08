import Amadeus, { FlightOffer } from 'amadeus';
import dotenv from 'dotenv';
dotenv.config();

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_HOST === 'production' ? 'production' : 'test',
});

// ----------------------------
// Expedia affiliate generator
// ----------------------------
function generateExpediaLink(from: string, to: string, departureDate: string, adults = 1) {
  const date = new Date(departureDate);
  const formatted = date
    .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\//g, '/'); // mm/dd/yyyy

  return `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:${from},to:${to},departure:${formatted}T00:00:00&passengers=adults:${adults}&mode=search&adref=1011l416900`;
}

// ----------------------------
// Price Validation
// ----------------------------
async function validateFlightPrice(offer: FlightOffer) {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post({
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [offer],
      },
    });

    const validatedOffer =
      response.data?.data?.flightOffers?.[0] ?? response.data?.flightOffers?.[0];
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

  console.log('\n================================================================================');
  console.log('🔍 NEW FLIGHT SEARCH REQUEST');
  console.log('================================================================================');
  console.log(`Route: ${originLocationCode} → ${destinationLocationCode}`);
  console.log(`Date: ${departureDate}`);
  console.log(`Passengers: ${adults}`);
  console.log('================================================================================\n');

  try {
    console.log(`🔥 Searching flights: ${originLocationCode} → ${destinationLocationCode} on ${departureDate}`);
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

    const offers: FlightOffer[] = response.data || [];
    console.log(`📡 Amadeus returned ${offers.length} offers`);

    // Transform offers for frontend
    const transformed = offers.map((offer: FlightOffer) => {
      const firstItinerary = offer.itineraries[0];
      const firstSegment = firstItinerary?.segments[0];
      const lastSegment = firstItinerary?.segments[firstItinerary.segments.length - 1];

      return {
        id: offer.id,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
        origin: firstSegment?.departure?.iataCode,
        destination: lastSegment?.arrival?.iataCode,
        itineraries: offer.itineraries,
        affiliateUrl: generateExpediaLink(
          firstSegment?.departure?.iataCode || '',
          lastSegment?.arrival?.iataCode || '',
          departureDate,
          Number(adults)
        ),
      };
    });

    console.log(`✅ Transformed ${transformed.length} flight offers`);
    console.log('🔍 Validating top 10 flight offers with Amadeus Pricing API...');

    // Validate first 10 flight prices
    const sample = offers.slice(0, 10);
    for (const offer of sample) {
      await validateFlightPrice(offer);
    }

    console.log(`🏁 Final flight list: ${transformed.length} flights`);
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log(`✅ Amadeus returned ${transformed.length} live flights`);

    return { success: true, data: transformed };
  } catch (error: any) {
    console.error('❌ searchFlights error:', error?.response?.data || error?.message || error);
    return { success: false, error: error?.message || 'Flight search failed' };
  }
}

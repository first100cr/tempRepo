import Amadeus from 'amadeus';
import dotenv from 'dotenv';

dotenv.config();

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
});

export interface FlightOffer {
  id: string;
  price: { total: string; currency: string };
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }[];
  }[];
}

/**
 * 🔗 Generate Expedia Affiliate Link
 */
function generateAffiliateLink(offer: FlightOffer): string {
  const publisherId = process.env.EXPEDIA_AFFILIATE_ID ?? '1011l416900';
  const base = 'https://www.expedia.com/Flights-Search';

  const firstSegment = offer.itineraries?.[0]?.segments?.[0];
  const lastSegment =
    offer.itineraries?.[0]?.segments?.[offer.itineraries?.[0]?.segments?.length - 1];

  if (!firstSegment || !lastSegment) {
    console.warn('⚠️ Missing segment data in offer:', offer.id);
    return base;
  }

  const origin = firstSegment.departure?.iataCode ?? '';
  const destination = lastSegment.arrival?.iataCode ?? '';
  const departureDate = (firstSegment.departure?.at ?? '').split('T')[0];

  return `${base}?trip=oneway&leg1=from:${origin},to:${destination},departure:${departureDate}TANYT&passengers=adults:1&options=cabinclass:economy&mode=search&adref=${publisherId}`;
}

/**
 * 🧠 Validate flight prices using Amadeus Flight Offers Price API
 */
async function validateFlightPrice(offer: FlightOffer) {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(JSON.stringify({ data: { type: 'flight-offers-pricing', flightOffers: [offer] } }));
    const validatedOffer = response.data?.flightOffers?.[0];

    if (!validatedOffer?.price?.total) {
      console.warn('⚠️ Price validation failed: No price returned');
      return null;
    }

    const validatedPrice = validatedOffer.price.total;
    if (validatedPrice !== offer.price.total) {
      console.log(`💰 Price changed for offer ${offer.id}: ${offer.price.total} → ${validatedPrice}`);
      return validatedOffer;
    }

    return validatedOffer;
  } catch (error: any) {
    console.warn('⚠️ Price validation failed:', error?.message || error);
    return null;
  }
}

/**
 * ✈️ Search flights using Amadeus API
 */
export async function searchFlights(origin: string, destination: string, departureDate: string, adults = 1) {
  console.log('\n================================================================================');
  console.log('🔍 NEW FLIGHT SEARCH REQUEST');
  console.log('================================================================================');
  console.log(`Route: ${origin} → ${destination}`);
  console.log(`Date: ${departureDate}`);
  console.log(`Passengers: ${adults}`);
  console.log('================================================================================\n');

  try {
    console.log('✅ Using Amadeus PRODUCTION API');
    console.log(`\n🔥 Searching flights: ${origin} → ${destination} on ${departureDate}`);

    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      currencyCode: 'INR',
      max: 50,
    });

    const offers: FlightOffer[] = response.data;
    console.log(`\n📡 Amadeus returned ${offers.length} offers`);

    const transformed = offers.map((offer) => ({
      id: offer.id,
      price: offer.price,
      origin,
      destination,
      itineraries: offer.itineraries,
      affiliateUrl: generateAffiliateLink(offer),
    }));

    console.log(`\n✅ Transformed ${transformed.length} flight offers`);
    console.log('🔍 Validating top 10 flight offers with Amadeus Pricing API...');

    // Validate top 10 offers
    const top10 = transformed.slice(0, 10);
    await Promise.all(
      top10.map(async (offer) => {
        const valid = await validateFlightPrice(offer as any);
        if (!valid) {
          console.warn(`⚠️ Price validation failed for offer ${offer.id}`);
        }
      })
    );

    console.log('🏁 Final flight list:', transformed.length, 'flights');
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log(`✅ Amadeus returned ${transformed.length} live flights`);
    console.log(`✅ SEARCH COMPLETED\n`);

    return transformed;
  } catch (error: any) {
    console.error('❌ Amadeus flight search failed:', error?.response?.data || error?.message || error);
    throw new Error('Flight search failed');
  }
}

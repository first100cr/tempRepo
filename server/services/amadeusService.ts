import Amadeus from "amadeus";

interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  origin: string;
  destination: string;
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }[];
  }[];
  affiliateUrl: string;
}

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
});

export async function fetchFlightOffers(params: {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  adults: number;
}) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults,
      currencyCode: "INR",
    });

    const offers: FlightOffer[] = response.data.map((offer: any) => ({
      id: offer.id,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      origin: offer.itineraries[0].segments[0].departure.iataCode,
      destination:
        offer.itineraries[0].segments[
          offer.itineraries[0].segments.length - 1
        ].arrival.iataCode,
      itineraries: offer.itineraries,
      affiliateUrl: generateExpediaAffiliateUrl(offer),
    }));

    return { success: true, data: offers };
  } catch (error: any) {
    console.error("❌ Amadeus API Error:", error);
    return { success: false, data: [], error: error.message };
  }
}

function generateExpediaAffiliateUrl(offer: any): string {
  const origin = offer.itineraries[0].segments[0].departure.iataCode;
  const destination =
    offer.itineraries[0].segments[
      offer.itineraries[0].segments.length - 1
    ].arrival.iataCode;
  const date = offer.itineraries[0].segments[0].departure.at.split("T")[0];

  return `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:${origin},to:${destination},departure:${date}TANYT&mode=search&adref=1011l416900`;
}

// Optional: Validate the price before returning
export async function validateFlightPrice(offerId: string, price: number) {
  try {
    const validationResponse = await amadeus.shopping.flightOffersPrice.post({
      data: {
        type: "flight-offers-pricing",
        flightOffers: [{ id: offerId }],
      },
    });

    const updatedPrice = parseFloat(
      validationResponse.data.flightOffers[0].price.total
    );

    return {
      valid: Math.abs(updatedPrice - price) < 5, // tolerance
      newPrice: updatedPrice,
    };
  } catch (error) {
    console.error("❌ Price validation failed:", error);
    return { valid: false, newPrice: price };
  }
}

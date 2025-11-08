declare module 'amadeus' {
  export interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: 'test' | 'production';
    logLevel?: 'debug' | 'warn' | 'silent';
  }

  // ==============================
  // 📦 SEARCH PARAMETERS
  // ==============================
  export interface FlightSearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: string;
    children?: string;
    infants?: string;
    travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    max?: string;
    currencyCode?: string;
    nonStop?: boolean;
  }

  export interface LocationSearchParams {
    keyword: string;
    subType: string;
    page?: {
      limit?: number;
      offset?: number;
    };
  }

  // ==============================
  // 📊 GENERIC RESPONSE WRAPPER
  // ==============================
  export interface AmadeusResponse<T = any> {
    data: T;
    meta?: {
      count?: number;
      links?: {
        self?: string;
        next?: string;
        previous?: string;
        last?: string;
        first?: string;
      };
    };
    dictionaries?: any;
  }

  // ==============================
  // ✈️ FLIGHT OFFER STRUCTURE
  // ==============================
  export interface FlightOffer {
    type: string;
    id: string;
    source: string;
    instantTicketingRequired: boolean;
    nonHomogeneous: boolean;
    oneWay: boolean;
    lastTicketingDate: string;
    numberOfBookableSeats: number;
    itineraries: Itinerary[];
    price: Price;
    pricingOptions: PricingOptions;
    validatingAirlineCodes: string[];
    travelerPricings: TravelerPricing[];
  }

  export interface Itinerary {
    duration: string;
    segments: Segment[];
  }

  export interface Segment {
    departure: LocationInfo;
    arrival: LocationInfo;
    carrierCode: string;
    number: string;
    aircraft: {
      code: string;
    };
    operating?: {
      carrierCode: string;
    };
    duration: string;
    id: string;
    numberOfStops: number;
    blacklistedInEU: boolean;
  }

  export interface LocationInfo {
    iataCode: string;
    terminal?: string;
    at: string;
  }

  // ==============================
  // 💰 PRICING STRUCTURES
  // ==============================
  export interface Price {
    currency: string;
    total: string;
    base: string;
    fees?: Fee[];
    grandTotal: string;
    taxes?: {
      amount: string;
      code: string;
    }[];
  }

  export interface Fee {
    amount: string;
    type: string;
  }

  export interface PricingOptions {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  }

  export interface TravelerPricing {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: Price;
    fareDetailsBySegment: FareDetailsBySegment[];
  }

  export interface FareDetailsBySegment {
    segmentId: string;
    cabin: string;
    fareBasis: string;
    brandedFare?: string;
    class: string;
    includedCheckedBags?: {
      quantity?: number;
      weight?: number;
      weightUnit?: string;
    };
  }

  // ==============================
  // 🏙️ AIRPORT STRUCTURE
  // ==============================
  export interface Airport {
    type: string;
    subType: string;
    name: string;
    detailedName: string;
    id: string;
    self: {
      href: string;
      methods: string[];
    };
    timeZoneOffset: string;
    iataCode: string;
    geoCode: {
      latitude: number;
      longitude: number;
    };
    address: {
      cityName: string;
      cityCode: string;
      countryName: string;
      countryCode: string;
      regionCode: string;
    };
    analytics: {
      travelers: {
        score: number;
      };
    };
  }

  // ==============================
  // ⚙️ MAIN AMADEUS CLASS
  // ==============================
  export default class Amadeus {
    constructor(config: AmadeusConfig);

    shopping: {
      flightOffersSearch: {
        get(params: FlightSearchParams): Promise<AmadeusResponse<FlightOffer[]>>;
      };
      flightOffers: {
        pricing: {
          /**
           * Validates a list of flight offers and returns the latest prices.
           * The response structure is similar to flightOffersSearch,
           * but may include updated taxes and fare basis info.
           */
          post(body: string): Promise<AmadeusResponse<FlightOffer[]>>;
        };
      };
    };

    referenceData: {
      locations: {
        get(params: LocationSearchParams): Promise<AmadeusResponse<Airport[]>>;
      };
      urls: {
        checkinLinks: {
          get(params: { airlineCode: string }): Promise<AmadeusResponse<any>>;
        };
      };
    };

    travel: {
      analytics: {
        airTraffic: {
          traveled: {
            get(params: any): Promise<AmadeusResponse<any>>;
          };
        };
      };
    };
  }
}

declare module 'amadeus' {
  export interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: 'test' | 'production';
    logLevel?: 'debug' | 'warn' | 'silent';
  }

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

  export interface Price {
    currency: string;
    total: string;
    base: string;
    fees?: Fee[];
    grandTotal: string;
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

  export default class Amadeus {
    constructor(config: AmadeusConfig);

    shopping: {
      flightOffersSearch: {
        get(params: FlightSearchParams): Promise<AmadeusResponse<FlightOffer[]>>;
      };
      flightOffers: {
        pricing: {
          post(body: string): Promise<AmadeusResponse<any>>;
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

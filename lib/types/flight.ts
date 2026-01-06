export interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string; // YYYY-MM-DD
    returnDate?: string; // YYYY-MM-DD
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    nonStop?: boolean;
    maxPrice?: number;
    currency?: string;
    maxResults?: number;
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
    pricingOptions: {
        fareType: string[];
        includedCheckedBagsOnly: boolean;
    };
    validatingAirlineCodes: string[];
    travelerPricings: TravelerPricing[];
}

export interface Itinerary {
    duration: string;
    segments: Segment[];
}

export interface Segment {
    departure: {
        iataCode: string;
        terminal?: string;
        at: string;
    };
    arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
    };
    carrierCode: string;
    number: string;
    aircraft: {
        code: string;
    };
    operating?: {
        carrierCode: string;
    };
    id: string;
    numberOfStops: number;
    blacklistedInEU: boolean;
    duration: string;
}

export interface Price {
    currency: string;
    total: string;
    base: string;
    fees?: {
        amount: string;
        type: string;
    }[];
    grandTotal?: string;
}

export interface TravelerPricing {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: Price;
    fareDetailsBySegment: {
        segmentId: string;
        cabin: string;
        fareBasis: string;
        class: string;
        includedCheckedBags?: {
            quantity?: number;
            weight?: number;
            weightUnit?: string;
        };
        segmentMeasures?: {
            co2Emissions?: {
                cabin?: string;
            };
        };
    }[];
}

export interface FlightSearchResponse {
    success: boolean;
    data: FlightOffer[];
    meta?: any;
    dictionaries?: {
        locations?: Record<string, any>;
        aircraft?: Record<string, string>;
        currencies?: Record<string, string>;
        carriers?: Record<string, string>;
    };
}

export interface TravelerDocument {
    documentType: 'PASSPORT' | 'IDENTITY_CARD' | 'VISA';
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    nationality: string;
    holder: boolean;
}

export interface TravelerInfo {
    id?: string;
    travelerType: 'ADULT' | 'CHILD' | 'INFANT';
    title?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE';
    email: string;
    phone: {
        countryCode: string;
        number: string;
    };
    documents?: TravelerDocument[];
    mealPreference?: string;
    specialAssistance?: string;
}

export interface CreateBookingRequest {
    flightOffers: FlightOffer[];
    travelers: TravelerInfo[];
    paymentMethod?: string;
    specialRequests?: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    data: {
        bookingId: string;
        bookingReference: string;
        paymentId: string;
        amount: number;
        currency: string;
        status: string;
    };
}

export interface PaymentIntentResponse {
    success: boolean;
    clientSecret: string;
    paymentIntentId: string;
    error?: string;
    message?: string;
}

export interface ConfirmBookingResponse {
    success: boolean;
    message: string;
    data?: {
        bookingReference: string;
        status: string;
        confirmationNumber?: string;
    };
    error?: string;
}

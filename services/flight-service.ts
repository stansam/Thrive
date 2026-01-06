import apiClient from '@/lib/api-client';
import {
    FlightSearchParams,
    FlightSearchResponse,
    FlightOffer,
    BookingResponse,
    CreateBookingRequest,
    ConfirmBookingResponse
} from '@/lib/types/flight';

export const flightService = {
    searchFlights: (params: FlightSearchParams) => {
        return apiClient.post<any, FlightSearchResponse>('/flights/search', params);
    },

    searchLocations: (keyword: string) => {
        return apiClient.get<any, { success: boolean; data: any[] }>('/flights/search/locations', {
            params: { keyword }
        });
    },

    confirmPrice: (flightOffers: FlightOffer[]) => {
        // Amadeus confirm_price endpoint expects { flightOffers: [...] }
        return apiClient.post<any, { success: boolean; data: any }>('/flights/price', { flightOffers });
    },

    createBooking: (bookingRequest: CreateBookingRequest) => {
        return apiClient.post<any, BookingResponse>('/flights/book', bookingRequest);
    },

    confirmBooking: (bookingId: string, paymentIntentId: string) => {
        return apiClient.post<any, ConfirmBookingResponse>('/flights/book/confirm', {
            bookingId,
            paymentIntentId
        });
    },

    getBooking: (bookingId: string) => {
        return apiClient.get<any, { success: boolean, data: any }>(`/flights/bookings/${bookingId}`);
    }
};

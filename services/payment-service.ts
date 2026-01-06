import apiClient from '@/lib/api-client';
import { PaymentIntentResponse } from '@/lib/types/flight';

export const paymentService = {
    createPaymentIntent: (bookingId: string, amount: number, currency: string) => {
        return apiClient.post<any, PaymentIntentResponse>('/api/payments/create-intent', {
            bookingId,
            amount,
            currency
        });
    }
};

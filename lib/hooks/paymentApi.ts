/**
 * Payment API Service
 * Frontend service for payment processing with Stripe integration
 */

import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import apiClient from '../api-client';
import { APIResponse } from '../types/dashboard';

// Initialize Stripe
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export interface PaymentIntentRequest {
    bookingId: string;
    amount: number;
    currency: string;
}

export interface PaymentConfirmRequest {
    paymentIntentId: string;
    bookingId: string;
}

export interface RefundRequest {
    paymentId: string;
    amount?: number;
    reason?: string;
}

class PaymentApiService {
    private stripe: Promise<Stripe | null>;

    constructor() {
        this.stripe = stripePromise;
    }

    // Helper to normalize errors
    private handleError(error: any): Error {
        return new Error(error.message || 'Payment operation failed');
    }

    /**
     * Create a payment intent
     */
    async createPaymentIntent(
        request: PaymentIntentRequest
    ): Promise<APIResponse<{ clientSecret: string; paymentIntentId: string }>> {
        try {
            return await apiClient.post('/payments/create-intent', request);
        } catch (error: any) {
            console.error('Create payment intent error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Confirm a payment
     */
    async confirmPayment(request: PaymentConfirmRequest): Promise<APIResponse<any>> {
        try {
            return await apiClient.post('/payments/confirm', request);
        } catch (error: any) {
            console.error('Confirm payment error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Process a refund
     */
    async processRefund(request: RefundRequest): Promise<APIResponse<any>> {
        try {
            return await apiClient.post('/payments/refund', request);
        } catch (error: any) {
            console.error('Process refund error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(paymentId: string): Promise<APIResponse<any>> {
        try {
            return await apiClient.get(`/payments/status/${paymentId}`);
        } catch (error: any) {
            console.error('Get payment status error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get booking payments
     */
    async getBookingPayments(bookingId: string): Promise<APIResponse<any[]>> {
        try {
            return await apiClient.get(`/payments/booking/${bookingId}`);
        } catch (error: any) {
            console.error('Get booking payments error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Process payment with Stripe Elements
     */
    async processPaymentWithElements(
        elements: StripeElements,
        bookingId: string,
        amount: number,
        currency: string = 'usd'
    ): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const stripe = await this.stripe;
            if (!stripe) {
                throw new Error('Stripe is not initialized');
            }

            // Step 1: Create payment intent
            // apiClient returns the data directly (e.g. { success: true, data: { ... } })
            const intentResponse = await this.createPaymentIntent({
                bookingId,
                amount,
                currency,
            });

            if (!intentResponse.success || !intentResponse.data?.clientSecret) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret, paymentIntentId } = intentResponse.data;

            // Step 2: Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`,
                },
                redirect: 'if_required',
            });

            if (stripeError) {
                throw new Error(stripeError.message || 'Payment failed');
            }

            if (paymentIntent.status !== 'succeeded') {
                throw new Error('Payment was not successful');
            }

            // Step 3: Confirm payment with backend
            const confirmResponse = await this.confirmPayment({
                paymentIntentId,
                bookingId,
            });

            if (!confirmResponse.success) {
                throw new Error(confirmResponse.message || 'Failed to confirm payment');
            }

            return {
                success: true,
                message: 'Payment processed successfully',
                data: confirmResponse.data,
            };
        } catch (error: any) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: error.message || 'Payment processing failed',
            };
        }
    }

    /**
     * Handle payment with payment method (for saved cards)
     */
    async processPaymentWithMethod(
        paymentMethodId: string,
        bookingId: string,
        amount: number,
        currency: string = 'usd'
    ): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const stripe = await this.stripe;
            if (!stripe) {
                throw new Error('Stripe is not initialized');
            }

            // Create payment intent
            const intentResponse = await this.createPaymentIntent({
                bookingId,
                amount,
                currency,
            });

            if (!intentResponse.success || !intentResponse.data?.clientSecret) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret, paymentIntentId } = intentResponse.data;

            // Confirm payment with payment method
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethodId,
            });

            if (error) {
                throw new Error(error.message || 'Payment failed');
            }

            if (paymentIntent.status !== 'succeeded') {
                throw new Error('Payment was not successful');
            }

            // Confirm with backend
            const confirmResponse = await this.confirmPayment({
                paymentIntentId,
                bookingId,
            });

            if (!confirmResponse.success) {
                throw new Error(confirmResponse.message || 'Failed to confirm payment');
            }

            return {
                success: true,
                message: 'Payment processed successfully',
                data: confirmResponse.data,
            };
        } catch (error: any) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: error.message || 'Payment processing failed',
            };
        }
    }

    async getStripe(): Promise<Stripe | null> {
        return this.stripe;
    }
}

export const paymentApi = new PaymentApiService();
export default paymentApi;
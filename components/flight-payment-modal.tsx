'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { flightService } from '@/services/flight-service';
import paymentApi from '@/lib/hooks/paymentApi'; // leveraging user's hook
import { FlightOffer, TravelerInfo } from '@/lib/types/flight';
import { useRouter } from 'next/navigation';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface FlightPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    currency: string;
    flightOffer: FlightOffer;
    travelers: TravelerInfo[];
}

function PaymentForm({ amount, currency, flightOffer, travelers, onSuccess, onError }: any) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            // 1. Create Booking first
            const bookingRequest = {
                flightOffers: [flightOffer],
                travelers: travelers,
                paymentMethod: 'CREDIT_CARD', // Simplified
            };

            const bookingResponse = await flightService.createBooking(bookingRequest);

            if (!bookingResponse.success || !bookingResponse.data?.bookingId) {
                throw new Error(bookingResponse.message || 'Failed to create booking');
            }

            const bookingId = bookingResponse.data.bookingId;

            // 2. Process Payment via PaymentApi (handles intent + confirm)
            const result = await paymentApi.processPaymentWithElements(
                elements,
                bookingId,
                amount,
                currency
            );

            if (result.success) {
                onSuccess(bookingId);
            } else {
                throw new Error(result.message);
            }

        } catch (error: any) {
            console.error('Payment failed:', error);
            setMessage(error.message || 'An unexpected error occurred during payment.');
            onError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-neutral-800 rounded-lg bg-black/50">
                <PaymentElement
                    options={{
                        layout: 'tabs'
                    }}
                />
            </div>

            {message && (
                <div className="p-3 rounded-md bg-red-900/20 border border-red-900/50 text-red-200 text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-white text-black hover:bg-neutral-200 h-12 text-lg font-medium"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <Lock className="h-3 w-3" />
                Payments are secure and encrypted
            </div>
        </form>
    );
}

export function FlightPaymentModal({
    isOpen,
    onClose,
    amount,
    currency,
    flightOffer,
    travelers
}: FlightPaymentModalProps) {
    const [step, setStep] = useState<'payment' | 'success'>('payment');
    const [bookingId, setBookingId] = useState<string | null>(null);
    const router = useRouter();

    // Reset state when closed/opened
    useEffect(() => {
        if (isOpen && step === 'success') {
            // If re-opened after success, maybe reset? Or keep? 
            // Logic depends on use case. Usually modal closes after success.
        }
    }, [isOpen, step]);

    const handleSuccess = (id: string) => {
        setBookingId(id);
        setStep('success');
    };

    const handleClose = () => {
        if (step === 'success') {
            // Redirect to booking confirmation or dashboard
            // router.push(`/bookings/${bookingId}`);
            // For now closes
            onClose();
            // Optional: clear session
            sessionStorage.removeItem('selectedFlightOffer');
        } else {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800 text-white p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2 bg-neutral-900">
                    <DialogTitle className="text-xl">
                        {step === 'payment' ? 'Complete Payment' : 'Booking Confirmed!'}
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        {step === 'payment'
                            ? 'Enter your payment details to confirm your booking.'
                            : 'Your flight has been successfully booked.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-2">
                    {step === 'payment' ? (
                        <div className="mt-4">
                            {/* We need to wrap PaymentElement in Elements provider. 
                                Ideally we fetch clientSecret first OR use mode='payment' setup.
                                But PaymentElement needs Elements wrapper with either clientSecret or mode/amount/currency.
                                Since we do intent creation inside the form submission (bad practice for Elements usually),
                                we should actually creating intent logic slightly differently or use 'mode' in Elements.
                                
                                Wait, 'paymentApi.processPaymentWithElements' does creating intent internally.
                                But <Elements> requires clientSecret or mode at init.
                                If we use 'mode: payment', we need generic currency/amount.
                            */}

                            <Elements stripe={stripePromise} options={{
                                mode: 'payment',
                                amount: Math.round(amount * 100), // in cents
                                currency: currency.toLowerCase(),
                                appearance: { theme: 'night' }
                            }}>
                                <PaymentForm
                                    amount={amount}
                                    currency={currency}
                                    flightOffer={flightOffer}
                                    travelers={travelers}
                                    onSuccess={handleSuccess}
                                    onError={() => { }}
                                />
                            </Elements>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="h-16 w-16 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">Payment Successful</h3>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Booking Reference: <span className="text-white font-mono">{bookingId}</span>
                                </p>
                            </div>
                            <Button
                                onClick={handleClose}
                                className="w-full mt-4 bg-white text-black hover:bg-neutral-200"
                            >
                                Close & View Booking
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

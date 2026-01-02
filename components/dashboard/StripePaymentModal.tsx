"use client"

/**
 * Stripe Payment Modal Component
 * Handles subscription upgrades with Stripe Elements
 * Matches dashboard styling and responsiveness
 */

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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, CreditCard, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
    tier: 'bronze' | 'silver' | 'gold';
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

function PaymentForm({ tier, amount, onSuccess, onCancel }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('idle');
        setErrorMessage('');

        try {
            // Confirm the payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard?payment=success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                setPaymentStatus('error');
                setErrorMessage(error.message || 'Payment failed. Please try again.');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setPaymentStatus('success');
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } catch (err: any) {
            setPaymentStatus('error');
            setErrorMessage(err.message || 'An unexpected error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Status Alerts */}
            {paymentStatus === 'success' && (
                <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                        Payment successful! Upgrading your subscription...
                    </AlertDescription>
                </Alert>
            )}

            {paymentStatus === 'error' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Subscription Summary */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscription Plan</span>
                    <Badge className="capitalize">{tier}</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Billing Cycle</span>
                    <span className="text-sm text-muted-foreground">Monthly</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-semibold">Total Due Today</span>
                    <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
                </div>
            </div>

            {/* Stripe Payment Element */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Payment Details</label>
                <div className="rounded-lg border p-4 bg-background">
                    <PaymentElement
                        options={{
                            layout: 'tabs',
                        }}
                    />
                </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                    Your payment information is encrypted and secure. We use Stripe for payment processing and never store your card details.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing || paymentStatus === 'success'}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing || paymentStatus === 'success'}
                    className="flex-1"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : paymentStatus === 'success' ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Success!
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay ${amount.toFixed(2)}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

interface StripePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: 'bronze' | 'silver' | 'gold';
    amount: number;
    clientSecret: string;
}

export default function StripePaymentModal({
    isOpen,
    onClose,
    tier,
    amount,
    clientSecret,
}: StripePaymentModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSuccess = () => {
        // Refresh the page or update subscription status
        window.location.reload();
    };

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--background))',
                colorText: 'hsl(var(--foreground))',
                colorDanger: 'hsl(var(--destructive))',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '0.5rem',
            },
        },
    };

    if (!mounted) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Complete Your Subscription
                    </DialogTitle>
                    <DialogDescription>
                        Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)} plan and unlock premium benefits
                    </DialogDescription>
                </DialogHeader>

                {clientSecret && (
                    <Elements stripe={stripePromise} options={options}>
                        <PaymentForm
                            tier={tier}
                            amount={amount}
                            onSuccess={handleSuccess}
                            onCancel={onClose}
                        />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
}

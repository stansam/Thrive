"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/ui/navbar";
import FooterSection from "@/components/ui/footer-section";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const fetcher = (url: string) => axios.get(url).then(res => res.data);

function CheckoutForm({ booking, clientSecret }: { booking: any, clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking/${booking.bookingReference}/confirmation`,
            },
            redirect: "if_required"
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Confirm explicitly with backend
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/confirm`, {
                    paymentIntentId: paymentIntent.id,
                    bookingReference: booking.bookingReference
                });
                router.push(`/booking/${booking.bookingReference}/confirmation`);
            } catch (err) {
                setMessage("Payment passed but server confirmation failed. Please contact support.");
            }
            setIsLoading(false);
        } else {
            setMessage("Payment processing...");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {message && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {message}
                </div>
            )}
            <Button
                disabled={isLoading || !stripe || !elements}
                className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : `Pay $${booking.totalPrice.toLocaleString()}`}
            </Button>
            <div className="flex justify-center items-center gap-2 text-xs text-neutral-500">
                <Lock className="h-3 w-3" />
                Payments are secure and encrypted
            </div>
        </form>
    );
}

export default function PaymentPage() {
    const params = useParams();
    const reference = params?.reference as string;
    const [clientSecret, setClientSecret] = React.useState("");

    // Fetch Booking
    const { data: result, error, isLoading: isBookingLoading } = useSWR(
        reference ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/reference/${reference}` : null,
        fetcher
    );
    const booking = result?.data;

    // Create Payment Intent on Load (if confirmed)
    React.useEffect(() => {
        if (booking && booking.status === 'confirmed' && !clientSecret) {
            axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/create-intent`, {
                bookingReference: booking.bookingReference
            })
                .then(res => setClientSecret(res.data.data.clientSecret))
                .catch(err => console.error("Intent Error", err));
        }
    }, [booking, clientSecret]);

    if (isBookingLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Loader2 className="animate-spin h-8 w-8" /></div>;

    if (!booking) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">Booking not found.</div>;

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 selection:bg-emerald-500/30">
            <Navbar />

            <main className="container mx-auto px-4 py-12 lg:py-24">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* LEFT: Summary */}
                        <div className="space-y-6">
                            <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 space-y-4">
                                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Booking Summary</h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-neutral-400">Reference</span>
                                        <span className="font-mono text-white">{booking.bookingReference}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-neutral-400">Package</span>
                                        <span className="font-medium text-white text-right max-w-[200px]">{booking.packageName}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-neutral-400">Departure</span>
                                        <span className="font-medium text-white">{format(new Date(booking.departureDate), 'PPP')}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-neutral-400">Travelers</span>
                                        <span className="font-medium text-white">{booking.travelers} Guests</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-emerald-400">${booking.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-blue-200">
                                <ShieldCheck className="h-5 w-5 shrink-0 text-blue-400" />
                                <p>
                                    Your data is encrypted. We partner with Stripe for secure payment processing.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Payment Form */}
                        <div className="bg-white rounded-xl p-6 lg:p-8 text-neutral-900 shadow-2xl">
                            {booking.status === 'confirmed' ? (
                                clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                        <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                                        <CheckoutForm booking={booking} clientSecret={clientSecret} />
                                    </Elements>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Loader2 className="animate-spin h-8 w-8 text-neutral-400" />
                                        <p className="text-neutral-500">Initializing secure payment...</p>
                                    </div>
                                )
                            ) : booking.status === 'paid' ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                                    <h2 className="text-2xl font-bold">Payment Complete</h2>
                                    <p className="text-neutral-600">This booking has already been paid for.</p>
                                    <Button asChild variant="outline" className="mt-4">
                                        <a href="/dashboard">Go to Dashboard</a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                    <AlertCircle className="h-16 w-16 text-orange-500" />
                                    <h2 className="text-2xl font-bold">Awaiting Confirmation</h2>
                                    <p className="text-neutral-600">This booking is currently <span className="font-mono font-bold uppercase">{booking.status}</span>.</p>
                                    <p className="text-sm text-neutral-500">Wait for your concierge to confirm availability.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}

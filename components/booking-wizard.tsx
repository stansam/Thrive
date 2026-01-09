'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { flightService } from '@/services/flight-service';
import paymentApi from '@/lib/hooks/paymentApi';
import { FlightOffer, TravelerInfo } from '@/lib/types/flight';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, AlertCircle, Plane, CreditCard, User, ChevronRight, ShieldCheck } from 'lucide-react';
import { PassportScanner, ScannedPassportData } from './passport-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingWizardProps {
    flightOffer: FlightOffer;
    user: any; // User context
}

type WizardStep = 'review' | 'travelers' | 'payment' | 'confirmation';

export function BookingWizard({ flightOffer, user }: BookingWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('review');
    const [travelers, setTravelers] = useState<TravelerInfo[]>([]);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [serviceFee, setServiceFee] = useState<number>(0);
    const [currency, setCurrency] = useState<string>('USD');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pnr, setPnr] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Initialize travelers based on flight offer requirements (adults, children, etc.)
    useEffect(() => {
        if (travelers.length === 0) {
            setTravelers([{
                id: '1',
                travelerType: 'ADULT',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                gender: 'MALE',
                email: user?.email || '',
                phone: user?.phone || ''
            }]);
        }
    }, [flightOffer, user]);

    // --- STEP LOGIC ---

    const handleTravelerUpdate = (index: number, field: keyof TravelerInfo, value: any) => {
        const updated = [...travelers];
        updated[index] = { ...updated[index], [field]: value };
        setTravelers(updated);
    };

    const handlePassportScan = (index: number, data: ScannedPassportData) => {
        const updated = [...travelers];
        updated[index] = {
            ...updated[index],
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.birthDate, // YYYY-MM-DD
            gender: data.gender,
            nationality: data.nationality,
            documents: [{
                documentType: 'PASSPORT',
                number: data.passportNumber,
                expiryDate: data.expirationDate,
                issuanceCountry: data.nationality, // Approx
                nationality: data.nationality,
                holder: true
            }]
        };
        setTravelers(updated);
        toast({
            title: "Passport Scanned",
            description: `Details for ${data.firstName} ${data.lastName} updated.`,
        });
    };

    const initBooking = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            // Validate travelers
            const invalid = travelers.find(t => !t.firstName || !t.lastName || !t.dateOfBirth);
            if (invalid) {
                throw new Error("Please fill in all traveler details.");
            }

            const request = {
                flightOffers: [flightOffer],
                travelers: travelers,
                paymentMethod: 'card' // default
            };

            const response = await flightService.createBooking(request);

            if (!response.success) {
                throw new Error(response.message || 'Booking initialization failed');
            }

            const { bookingId, amount, currency } = response.data;
            setBookingId(bookingId);
            setServiceFee(amount); // This is the Service Fee
            setCurrency(currency);

            // Move to payment
            setCurrentStep('payment');

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to initialize booking.");
        } finally {
            setIsProcessing(false);
        }
    };

    const onPaymentSuccess = async (paymentIntentId: string) => {
        setIsProcessing(true);
        // setStatus('Confirming with Airline...'); // removed status state var to simplified
        try {
            if (!bookingId) throw new Error("No booking ID found");

            const response = await flightService.confirmBooking(bookingId, paymentIntentId);

            if (!response.success) {
                throw new Error(response.message || 'Confirmation failed');
            }

            setPnr(response.data.bookingReference);
            setCurrentStep('confirmation');

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Payment succeeded but airline confirmation failed. Please contact support.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDER HELPERS ---

    const steps = [
        { id: 'review', label: 'Review', icon: Plane },
        { id: 'travelers', label: 'Travelers', icon: User },
        { id: 'payment', label: 'Fee Payment', icon: CreditCard },
        { id: 'confirmation', label: 'Confirmation', icon: CheckCircle2 },
    ];

    const currentStepIdx = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">

            {/* Progress Bar */}
            <div className="w-full bg-neutral-900/50 rounded-full h-2 mb-8 relative overflow-hidden">
                <div
                    className="bg-sky-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                />
            </div>

            <div className="flex justify-between px-2 mb-8 -mt-6">
                {steps.map((s, idx) => (
                    <div key={s.id} className={`flex flex-col items-center gap-1 ${idx <= currentStepIdx ? 'text-sky-400' : 'text-neutral-600'}`}>
                        <div className={`p-2 rounded-full border-2 ${idx <= currentStepIdx ? 'border-sky-500 bg-sky-950' : 'border-neutral-800 bg-neutral-900'}`}>
                            <s.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium">{s.label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-white">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* STEP 1: REVIEW */}
            {currentStep === 'review' && (
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle>Review Your Quote</CardTitle>
                        <CardDescription>Review the flight details and estimated fees.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-neutral-800 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Total Ticket Price</span>
                                <span className="text-xl font-bold text-white">{flightOffer.price.total} {flightOffer.price.currency}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-yellow-500/80">
                                <span>Payable later directly to airline</span>
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>

                        <Alert className="bg-blue-900/20 border-blue-900/50 text-blue-100">
                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                            <AlertTitle>Concierge Service</AlertTitle>
                            <AlertDescription>
                                To secure this price and holding (PNR), we charge a small service fee handled by Thrive.
                                The ticket cost itself will be settled afterwards with our admin support or directly with the airline.
                            </AlertDescription>
                        </Alert>

                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={() => setCurrentStep('travelers')} className="bg-white text-black hover:bg-neutral-200">
                            Continue to Traveler Details <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* STEP 2: TRAVELERS */}
            {currentStep === 'travelers' && (
                <div className="space-y-6">
                    {travelers.map((traveler, idx) => (
                        <Card key={idx} className="bg-neutral-900 border-neutral-800">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>Traveler {idx + 1} ({traveler.travelerType})</span>
                                    {idx > 0 && <Button variant="ghost" size="sm" onClick={() => {
                                        const newT = [...travelers];
                                        newT.splice(idx, 1);
                                        setTravelers(newT);
                                    }} className="text-red-400 hover:text-red-300">Remove</Button>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <PassportScanner
                                    onScanComplete={(data) => handlePassportScan(idx, data)}
                                    onError={(msg) => toast({ title: "OCR Error", description: msg, variant: "destructive" })}
                                />
                                <Separator className="bg-neutral-800" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input
                                            value={traveler.firstName}
                                            onChange={(e) => handleTravelerUpdate(idx, 'firstName', e.target.value)}
                                            className="bg-black/50 border-neutral-700"
                                            placeholder="As on passport"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={traveler.lastName}
                                            onChange={(e) => handleTravelerUpdate(idx, 'lastName', e.target.value)}
                                            className="bg-black/50 border-neutral-700"
                                            placeholder="As on passport"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <Input
                                            type="date"
                                            value={traveler.dateOfBirth}
                                            onChange={(e) => handleTravelerUpdate(idx, 'dateOfBirth', e.target.value)}
                                            className="bg-black/50 border-neutral-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <select
                                            className="w-full h-10 rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-white"
                                            value={traveler.gender}
                                            onChange={(e) => handleTravelerUpdate(idx, 'gender', e.target.value)}
                                        >
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </select>
                                    </div>
                                    {/* Add Email/Phone for primary contact (first traveler) */}
                                    {idx === 0 && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Contact Email</Label>
                                                <Input
                                                    value={traveler.email}
                                                    onChange={(e) => handleTravelerUpdate(idx, 'email', e.target.value)}
                                                    className="bg-black/50 border-neutral-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Contact Phone</Label>
                                                <Input
                                                    value={traveler.phone}
                                                    onChange={(e) => handleTravelerUpdate(idx, 'phone', e.target.value)}
                                                    className="bg-black/50 border-neutral-700"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep('review')} className="border-neutral-700 text-neutral-300">
                            Back
                        </Button>
                        <Button
                            onClick={initBooking}
                            disabled={isProcessing}
                            className="bg-white text-black hover:bg-neutral-200"
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: PAYMENT */}
            {currentStep === 'payment' && <ClientSecretWrapper amount={serviceFee} currency={currency} bookingId={bookingId} onSuccess={onPaymentSuccess} />}

            {/* STEP 4: CONFIRMATION */}
            {currentStep === 'confirmation' && (
                <Card className="bg-neutral-900 border-neutral-800 text-center py-12">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl mb-2">Booking Held Successfully!</CardTitle>
                    <CardDescription className="text-lg text-neutral-400 mb-8">
                        Your PNR is <span className="text-white font-mono font-bold bg-neutral-800 px-2 py-1 rounded">{pnr}</span>
                    </CardDescription>

                    <div className="max-w-md mx-auto p-4 bg-neutral-800/50 rounded-lg text-left mb-8 space-y-2">
                        <h4 className="font-semibold text-white">Next Steps:</h4>
                        <ul className="list-disc pl-5 text-neutral-300 space-y-1 text-sm">
                            <li>Your booking is currently held with the airline.</li>
                            <li>A support agent will contact you shortly to finalize the full ticket payment.</li>
                            <li>Check your email for the detailed itinerary.</li>
                        </ul>
                    </div>

                    <Button onClick={() => router.push('/dashboard')} className="bg-white text-black hover:bg-neutral-200 min-w-[200px]">
                        Go to Dashboard
                    </Button>
                </Card>
            )}

        </div>
    );
}

// Wrapper to handle Elements context cleanly
function ClientSecretWrapper({ amount, currency, bookingId, onSuccess }: { amount: number, currency: string, bookingId: string | null, onSuccess: (pi: string) => void }) {
    if (!bookingId || amount === 0) {
        if (amount === 0) {
            return (
                <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-500 mb-4" />
                    <p className="text-neutral-400">Processing Fee Waiver...</p>
                    <EffectTrigger onTrigger={() => onSuccess('waived')} />
                </div>
            );
        }
        return <div className="text-red-500 text-center py-4">Error: Invalid Payment Setup. Missing booking ID.</div>;
    }

    return (
        <Elements stripe={stripePromise} options={{
            mode: 'payment',
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            appearance: { theme: 'night' }
        }}>
            <PaymentForm amount={amount} currency={currency} bookingId={bookingId} onSuccess={onSuccess} />
        </Elements>
    );
}

function EffectTrigger({ onTrigger }: { onTrigger: () => void }) {
    useEffect(() => {
        const t = setTimeout(onTrigger, 1500);
        return () => clearTimeout(t);
    }, []);
    return null;
}

function PaymentForm({ amount, currency, bookingId, onSuccess }: { amount: number, currency: string, bookingId: string, onSuccess: (pi: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setMsg('');

        try {
            const result = await paymentApi.processPaymentWithElements(
                elements,
                bookingId,
                amount,
                currency
            );

            if (result.success && result.paymentIntentId) {
                onSuccess(result.paymentIntentId);
            } else {
                throw new Error(result.message || "Payment processing failed");
            }

        } catch (e: any) {
            console.error("Payment Error:", e);
            setMsg(e.message || "An error occurred during payment");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle>Pay Concierge Fee</CardTitle>
                <CardDescription>
                    Complete the secure payment of {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)} to hold your booking.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 border border-neutral-800 rounded-lg bg-black/50">
                        <PaymentElement options={{ layout: 'tabs' }} />
                    </div>
                    {msg && (
                        <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-100">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{msg}</AlertDescription>
                        </Alert>
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
                            `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}`
                        )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                        <ShieldCheck className="h-3 w-3" />
                        Secure Payment via Stripe
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

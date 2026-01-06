'use client';

import Navbar from '@/components/ui/navbar';
import FooterSection from '@/components/ui/footer-section';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FlightItineraryConfirmation } from '@/components/flight-itinerary-confirmation';
import { FlightPricingSummary } from '@/components/flight-pricing-summary';
import { FlightEmissionsDisplay } from '@/components/flight-emissions-display';
import { TravelerDetailsForm, TravelerData } from '@/components/traveler-details-form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useRouter } from 'next/navigation';
import { flightService } from '@/services/flight-service';
import { FlightOffer, TravelerInfo, CreateBookingRequest } from '@/lib/types/flight';
import { FlightPaymentModal } from '@/components/flight-payment-modal';

function FlightPricingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const flightId = searchParams.get('id'); // We might use this for validation

    const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
    const [loading, setLoading] = useState(true);
    const [priceConfirmed, setPriceConfirmed] = useState(false);
    const [dictionaries, setDictionaries] = useState<any>({}); // State to hold dictionaries

    // Traveler State - Array for multiple travelers support in future, currently 1
    const [travelerDetails, setTravelerDetails] = useState<TravelerData>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        phone: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: ""
    });
    const [errors, setErrors] = useState<Partial<Record<keyof TravelerData, string>>>({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpiredDialog, setShowExpiredDialog] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined') {
                const storedDictionaries = sessionStorage.getItem('flightDictionaries');
                if (storedDictionaries) {
                    setDictionaries(JSON.parse(storedDictionaries));
                }

                const storedOffer = sessionStorage.getItem('selectedFlightOffer');

                if (storedOffer) {
                    const offer: FlightOffer = JSON.parse(storedOffer);
                    setSelectedOffer(offer);

                    try {
                        // Confirm price with backend
                        const response = await flightService.confirmPrice([offer]);
                        if (response.success && response.data.flightOffers && response.data.flightOffers.length > 0) {
                            setSelectedOffer(response.data.flightOffers[0]);
                            setPriceConfirmed(true);
                        } else {
                            console.error("Price confirmation failed");
                            setApiError("Could not confirm flight price. It may no longer be available.");
                        }
                    } catch (err: any) {
                        console.error("Price confirmation failed:", JSON.stringify(err));

                        // Handle specific validation/expiry errors
                        const isExpiryError =
                            err?.error === 'VALIDATION_ERROR' ||
                            err?.errorCode === 'VALIDATION_ERROR' ||
                            err?.details?.errors?.some((e: any) => e.code === 4926 || e.detail?.includes('No fare applicable'));

                        if (isExpiryError) {
                            setShowExpiredDialog(true);
                        } else {
                            const message = err?.message || "Failed to confirm flight price.";
                            setApiError(message);
                            // Only alert if not showing expired dialog, to avoid double popup feels
                            // alert(message); 
                        }
                    } finally {
                        setLoading(false);
                    }
                } else {
                    // No flight selected, redirect
                    router.push('/flights/results');
                }
            }
        };
        init();
    }, [router]);

    const validateForm = () => {
        const newErrors: any = {};
        if (!travelerDetails.firstName) newErrors.firstName = "Required";
        if (!travelerDetails.lastName) newErrors.lastName = "Required";
        if (!travelerDetails.email) newErrors.email = "Required";
        else if (!/\S+@\S+\.\S+/.test(travelerDetails.email)) newErrors.email = "Invalid email";
        if (!travelerDetails.phone) newErrors.phone = "Required";
        if (!travelerDetails.dateOfBirth) newErrors.dateOfBirth = "Required";
        // Basic passport validation if fields are present or required logic needs to be stricter

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceedToPayment = () => {
        if (validateForm() && priceConfirmed) {
            setShowPaymentModal(true);
        }
    };

    if (loading || !selectedOffer) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    // Flatten segments for display - currently handling first itinerary only (one-way)
    const segments = selectedOffer.itineraries[0].segments.map(seg => ({
        ...seg,
        airlineName: dictionaries?.carriers?.[seg.carrierCode] || seg.carrierCode,
        // Placeholder logo or map from dictionary if available
        airlineLogo: `https://pic.al/8.png`
    }));

    const baseFare = parseFloat(selectedOffer.price.base || selectedOffer.price.total);
    const totalPrice = parseFloat(selectedOffer.price.total);
    const taxes = selectedOffer.price.base ? (totalPrice - baseFare) : 0;
    const fees = selectedOffer.price.fees?.reduce((acc, fee) => acc + parseFloat(fee.amount), 0) || 0;

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <Navbar />

            {/* Header */}
            <div className="bg-neutral-900 border-b border-neutral-800 py-6 px-4 pt-24">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link href="/flights/results">
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Review Your Trip</h1>
                        <p className="text-neutral-400 text-sm">Check details and enter traveler information</p>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Itinerary & Traveler Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Itinerary Display */}
                    <FlightItineraryConfirmation segments={segments} />

                    {/* Traveler Form */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Traveler Information</h2>
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                            <TravelerDetailsForm
                                id="1"
                                travelerType="Adult"
                                onChange={setTravelerDetails}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Price Summary */}
                <div className="lg:col-span-1 relative">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <FlightPricingSummary
                            baseFare={baseFare}
                            taxes={taxes}
                            fees={fees}
                            currency={selectedOffer.price.currency}
                            travelerDetails={travelerDetails}
                            onProceed={handleProceedToPayment}
                        />

                        <FlightEmissionsDisplay
                            co2Amount={selectedOffer.travelerPricings[0]?.fareDetailsBySegment[0]?.segmentMeasures?.co2Emissions?.cabin
                                ? `${selectedOffer.travelerPricings[0].fareDetailsBySegment[0].segmentMeasures.co2Emissions.cabin} kg`
                                : "N/A"}
                            comparison="-10% vs avg"
                        />
                    </div>
                </div>
            </main>

            <FlightPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={totalPrice}
                currency={selectedOffer.price.currency}
                flightOffer={selectedOffer}
                travelers={[
                    {
                        id: '1',
                        travelerType: 'ADULT',
                        firstName: travelerDetails.firstName,
                        lastName: travelerDetails.lastName,
                        dateOfBirth: travelerDetails.dateOfBirth,
                        gender: (travelerDetails.gender.toUpperCase() as any) || 'MALE',
                        email: travelerDetails.email,
                        phone: { countryCode: '1', number: travelerDetails.phone }
                    }
                ]}
            />

            <FooterSection />
            {/* Expired Fare Dialog */}
            <AlertDialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Price No Longer Available</AlertDialogTitle>
                        <AlertDialogDescription>
                            The price for this flight has changed or is no longer available.
                            We will take you back to search results to find updated options.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => router.push('/flights/results')}>
                            Back to Search
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Generic Error Dialog */}
            <AlertDialog open={!!apiError} onOpenChange={(open) => !open && setApiError(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Something went wrong</AlertDialogTitle>
                        <AlertDialogDescription>
                            {apiError}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setApiError(null)}>
                            Close
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function FlightPricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <FlightPricingContent />
        </Suspense>
    );
}

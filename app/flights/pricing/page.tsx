'use client';

import Navbar from '@/components/ui/navbar';
import FooterSection from '@/components/ui/footer-section';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { flightService } from '@/services/flight-service';
import { FlightOffer } from '@/lib/types/flight';
import { BookingWizard } from '@/components/booking-wizard';
import { useAuth } from "@/lib/auth_context";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function FlightPricingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); // Get user context

    const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showExpiredDialog, setShowExpiredDialog] = useState(false);

    const [dictionaries, setDictionaries] = useState<any>({});

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
                        } else {
                            console.error("Price confirmation failed");
                            setApiError("Could not confirm flight price. It may no longer be available.");
                        }
                    } catch (err: any) {
                        console.error("Price confirmation failed:", JSON.stringify(err));
                        const isExpiryError =
                            err?.error === 'VALIDATION_ERROR' ||
                            err?.errorCode === 'VALIDATION_ERROR' ||
                            err?.details?.errors?.some((e: any) => e.code === 4926 || e.detail?.includes('No fare applicable'));

                        if (isExpiryError) {
                            setShowExpiredDialog(true);
                        } else {
                            setApiError(err?.message || "Failed to confirm flight price.");
                        }
                    } finally {
                        setLoading(false);
                    }
                } else {
                    router.push('/flights/results');
                }
            }
        };
        init();
    }, [router]);

    if (loading || authLoading || !selectedOffer) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold">Secure Your Booking</h1>
                        <p className="text-neutral-400 text-sm">Complete the steps below to hold your flight.</p>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:py-8">
                <BookingWizard flightOffer={selectedOffer} user={user} dictionaries={dictionaries} />
            </main>

            <FooterSection />

            {/* Expired Fare Dialog */}
            <AlertDialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Price No Longer Available</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            The price for this flight has changed or is no longer available.
                            We will take you back to search results to find updated options.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => router.push('/flights/results')} className="bg-white text-black hover:bg-neutral-200">
                            Back to Search
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Generic Error Dialog */}
            <AlertDialog open={!!apiError} onOpenChange={(open) => !open && setApiError(null)}>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Notice</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            {apiError}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setApiError(null)} className="bg-white text-black hover:bg-neutral-200">
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

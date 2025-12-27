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

// Mock Data Structure matching flight_offers_price_api.txt structure partially for visualization
const MOCK_PRICING_DATA = {
    "1": {
        id: "1",
        price: {
            base: 1150.00,
            taxes: 120.50,
            fees: 40.00,
            currency: "USD"
        },
        emissions: {
            co2: "145 kg",
            comparison: "-12% vs avg"
        },
        itineraries: [
            {
                segments: [
                    {
                        id: "seg_1",
                        departure: { iataCode: "SFO", at: "2025-06-25T10:15:00", terminal: "I" },
                        arrival: { iataCode: "JFK", at: "2025-06-25T21:30:00", terminal: "4" },
                        carrierCode: "EK",
                        number: "204",
                        aircraft: { code: "777" },
                        duration: "PT5H15M",
                        airlineName: "Emirates",
                        airlineLogo: "https://images.unsplash.com/photo-1582972847525-4b087d3a0c77?q=80&w=200&auto=format&fit=crop"
                    }
                ]
            }
        ]
    },
    "2": { // Qatar
        id: "2",
        price: {
            base: 1300.00,
            taxes: 110.00,
            fees: 40.00,
            currency: "USD"
        },
        emissions: {
            co2: "320 kg",
            comparison: "+5% vs avg"
        },
        itineraries: [
            {
                segments: [
                    {
                        id: "seg_2a",
                        departure: { iataCode: "SFO", at: "2025-06-25T14:00:00" },
                        arrival: { iataCode: "DXB", at: "2025-06-26T06:45:00" },
                        carrierCode: "QR",
                        number: "738",
                        duration: "PT15H45M",
                        airlineName: "Qatar Airways",
                        airlineLogo: "https://images.unsplash.com/photo-1616423640778-2cfd1e389d42?q=80&w=200&auto=format&fit=crop"
                    }
                ]
            }
        ]
    }
};

function FlightPricingContent() {
    const searchParams = useSearchParams();
    const flightId = searchParams.get('id');
    const [flightData, setFlightData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Traveler State
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

    useEffect(() => {
        // Simulate API Fetch
        const timer = setTimeout(() => {
            if (flightId && MOCK_PRICING_DATA[flightId as keyof typeof MOCK_PRICING_DATA]) {
                setFlightData(MOCK_PRICING_DATA[flightId as keyof typeof MOCK_PRICING_DATA]);
            } else {
                // Default fallback if ID not found or generic
                setFlightData(MOCK_PRICING_DATA["1"]);
            }
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [flightId]);

    const validateForm = () => {
        const newErrors: Partial<Record<keyof TravelerData, string>> = {};
        if (!travelerDetails.firstName) newErrors.firstName = "First Name is required";
        if (!travelerDetails.lastName) newErrors.lastName = "Last Name is required";
        if (!travelerDetails.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
        if (!travelerDetails.email) newErrors.email = "Email is required";
        if (!travelerDetails.phone) newErrors.phone = "Phone is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBooking = () => {
        if (validateForm()) {
            console.log("Booking Data:", { flightId, travelerDetails });
            alert(`Booking confirmed for ${travelerDetails.firstName} ${travelerDetails.lastName}! Proceeding to payment...`);
            // In real app: router.push('/flight/payment')
        } else {
            // Scroll to error or alert
            alert("Please fill in all required traveler details.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!flightData) return <div>Flight not found.</div>;

    const segments = flightData.itineraries?.[0]?.segments || [];

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <Navbar />

            {/* Header */}
            <div className="bg-neutral-900 border-b border-neutral-800 pt-24 pb-6">
                <div className="max-w-7xl mx-auto px-4">
                    <Link href="/flights/results" className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 mb-4 w-fit">
                        <ArrowLeft className="h-4 w-4" /> Back to Results
                    </Link>
                    <h1 className="text-2xl font-bold">Review your trip</h1>
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Free cancellation within 24 hours</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Itinerary & Details */}
                <div className="lg:col-span-2 space-y-6">
                    <FlightItineraryConfirmation segments={segments} />

                    <FlightEmissionsDisplay
                        co2Amount={flightData.emissions.co2}
                        comparison={flightData.emissions.comparison}
                    />

                    {/* Traveler Details Form */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Traveler Information</h2>
                        <TravelerDetailsForm
                            id="1"
                            travelerType="Adult"
                            onChange={setTravelerDetails}
                            errors={errors}
                        />
                    </div>
                </div>

                {/* Right Column: Price Summary */}
                <div className="lg:col-span-1">
                    <FlightPricingSummary
                        baseFare={flightData.price.base}
                        taxes={flightData.price.taxes}
                        fees={flightData.price.fees}
                        currency={flightData.price.currency}
                        onProceed={handleBooking}
                    />
                </div>
            </main>

            <FooterSection />
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

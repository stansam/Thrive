'use client';

import Navbar from '@/components/ui/navbar';
import FooterSection from '@/components/ui/footer-section';
import AdvancedFlightSearch from '@/components/advanced-flight-search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LayoutGrid, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FlightCard } from '@/components/ui/flight-card';
import { FlightCardGrid } from '@/components/ui/flight-card-grid';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_FLIGHTS = [
    {
        id: '1',
        airline: {
            name: 'Emirates',
            logo: 'https://images.unsplash.com/photo-1582972847525-4b087d3a0c77?q=80&w=200&auto=format&fit=crop', // Placeholder
            flightNumber: 'EK 204'
        },
        departureTime: '10:15',
        departureCode: 'SFO',
        departureCity: 'San Francisco',
        arrivalTime: '21:30',
        arrivalCode: 'JFK',
        arrivalCity: 'New York',
        duration: '5h 15m',
        stops: 0,
        price: 1250,
        currency: 'USD',
        offer: 'Best Value',
        class: 'Economy',
        refundableType: 'Refundable',
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '2',
        airline: {
            name: 'Qatar Airways',
            logo: 'https://images.unsplash.com/photo-1616423640778-2cfd1e389d42?q=80&w=200&auto=format&fit=crop', // Placeholder
            flightNumber: 'QR 738'
        },
        departureTime: '14:00',
        departureCode: 'SFO',
        departureCity: 'San Francisco',
        arrivalTime: '06:45 +1',
        arrivalCode: 'DXB',
        arrivalCity: 'Dubai',
        duration: '15h 45m',
        stops: 1,
        price: 1450,
        currency: 'USD',
        offer: '',
        class: 'Business',
        refundableType: 'Non-Refundable',
        imageUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '3',
        airline: {
            name: 'Lufthansa',
            logo: 'https://images.unsplash.com/photo-1542296332-2e44a996aa0d?q=80&w=200&auto=format&fit=crop', // Placeholder
            flightNumber: 'LH 455'
        },
        departureTime: '18:30',
        departureCode: 'SFO',
        departureCity: 'San Francisco',
        arrivalTime: '14:20 +1',
        arrivalCode: 'LHR',
        arrivalCity: 'London',
        duration: '10h 50m',
        stops: 0,
        price: 980,
        currency: 'USD',
        offer: 'Special Deal',
        class: 'Economy',
        refundableType: 'Partial Refundable',
        imageUrl: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '4',
        airline: {
            name: 'Singapore Airlines',
            logo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=200&auto=format&fit=crop', // Placeholder
            flightNumber: 'SQ 031'
        },
        departureTime: '09:15',
        departureCode: 'SFO',
        departureCity: 'San Francisco',
        arrivalTime: '19:45 +1',
        arrivalCode: 'SIN',
        arrivalCity: 'Singapore',
        duration: '16h 30m',
        stops: 2,
        price: 1100,
        currency: 'USD',
        offer: '',
        class: 'Economy',
        refundableType: 'Refundable',
        imageUrl: 'https://images.unsplash.com/photo-1520183802803-06f731a2059f?q=80&w=1000&auto=format&fit=crop'
    },
];

function FlightResultsContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const formatPrice = (price: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            <Navbar />

            {/* Hero / Search Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-neutral-900/50 to-black border-b border-neutral-800">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                        <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                            <ArrowLeft className="h-3 w-3" /> Back to Home
                        </Link>
                        <span>/</span>
                        <span className="text-white">Flight Results</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 mb-2">
                                Select Your Flight
                            </h1>
                            <p className="text-neutral-400 text-sm max-w-xl">
                                Found {MOCK_FLIGHTS.length} results for your trip.
                            </p>
                        </div>
                    </div>

                    {/* The Advanced Search Component */}
                    <AdvancedFlightSearch className="mb-8" />
                </div>
            </section>

            {/* Results Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:py-8">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sticky top-20 z-30 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 text-xs border-dashed">
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter Results
                        </Button>
                        <div className="h-4 w-[1px] bg-neutral-800 mx-2" />
                        <div className="flex items-center gap-2">
                            {/* Example Quick Filters */}
                            <Badge variant="secondary" className="cursor-pointer hover:bg-neutral-700">Best Value</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-neutral-800 border-dashed text-neutral-400">Fastest</Badge>
                        </div>
                    </div>

                    <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list' ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                            )}
                            aria-label="List View"
                        >
                            <ListIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'grid' ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                            )}
                            aria-label="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={cn(
                        "grid gap-6",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col items-center"
                    )}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={cn(
                                "bg-neutral-900/50 rounded-xl animate-pulse border border-white/5 w-full",
                                viewMode === 'grid' ? "h-[350px]" : "h-40 max-w-5xl"
                            )} />
                        ))}
                    </div>
                ) : (
                    <>
                        {MOCK_FLIGHTS.length > 0 ? (
                            <>
                                <div className={cn(
                                    "gap-6",
                                    viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col items-center w-full"
                                )}>
                                    {MOCK_FLIGHTS.map((flight) => (
                                        viewMode === 'list' ? (
                                            <FlightCard
                                                key={flight.id}
                                                airline={{
                                                    name: flight.airline.name,
                                                    logo: flight.airline.logo,
                                                    flightNumber: flight.airline.flightNumber
                                                }}
                                                departureTime={flight.departureTime}
                                                arrivalTime={flight.arrivalTime}
                                                duration={flight.duration}
                                                stops={flight.stops}
                                                price={flight.price}
                                                currency={flight.currency}
                                                offer={flight.offer}
                                                refundableType={flight.refundableType}
                                                onBook={() => alert(`Booking flight ${flight.id}`)}
                                                onFlightDetails={() => alert(`Details for ${flight.id}`)}
                                            />
                                        ) : (
                                            <FlightCardGrid
                                                key={flight.id}
                                                imageUrl={flight.imageUrl}
                                                airline={flight.airline.name}
                                                flightCode={flight.airline.flightNumber}
                                                flightClass={flight.class}
                                                departureCode={flight.departureCode}
                                                departureCity={flight.departureCity}
                                                departureTime={flight.departureTime}
                                                arrivalCode={flight.arrivalCode}
                                                arrivalCity={flight.arrivalCity}
                                                arrivalTime={flight.arrivalTime}
                                                duration={flight.duration}
                                                price={formatPrice(flight.price, flight.currency)}
                                                onBook={() => alert(`Booking flight ${flight.id}`)}
                                            />
                                        )
                                    ))}
                                </div>

                                {/* Total Results Indicator */}
                                <div className="fixed bottom-6 right-6 z-40">
                                    <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-sm shadow-xl hover:bg-white/20 transition-colors">
                                        Total Results: {MOCK_FLIGHTS.length}
                                    </Badge>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">✈️</span>
                                </div>
                                <h3 className="text-xl font-medium text-white">No Flights Found</h3>
                                <p className="text-neutral-500 max-w-md">
                                    Try adjusting your search filters to find what you're looking for.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <FooterSection />
        </div>
    );
}

export default function FlightResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <FlightResultsContent />
        </Suspense>
    );
}

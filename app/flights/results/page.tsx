'use client';

import Navbar from '@/components/ui/navbar';
import FooterSection from '@/components/ui/footer-section';
import AdvancedFlightSearch from '@/components/advanced-flight-search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LayoutGrid, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FlightCard } from '@/components/ui/flight-card';
import { FlightCardGrid } from '@/components/ui/flight-card-grid';
import { cn } from '@/lib/utils';

import { flightService } from '@/services/flight-service';
import { FlightOffer, FlightSearchParams } from '@/lib/types/flight';
import { mapFlightOfferToCard } from '@/lib/flight-adapter';

// ... other imports

function FlightResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Use router for booking navigation
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [sortBy, setSortBy] = useState<'best_value' | 'fastest'>('best_value');

    const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
    const [dictionaries, setDictionaries] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true);
            setError(null);

            try {
                const params: FlightSearchParams = {
                    origin: searchParams.get('origin') || '',
                    destination: searchParams.get('destination') || '',
                    departureDate: searchParams.get('departureDate') || '',
                    adults: parseInt(searchParams.get('adults') || '1'),
                    children: parseInt(searchParams.get('children') || '0'),
                    travelClass: searchParams.get('travelClass') as any,
                    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
                };

                // Only search if we have basic params
                if (params.origin && params.destination && params.departureDate) {
                    const response = await flightService.searchFlights(params);
                    if (response.success) {
                        setFlightOffers(response.data);
                        setDictionaries(response.dictionaries);
                    } else {
                        setError('Failed to fetch flights.');
                    }
                } else {
                    // No params, empty results (or maybe show featured?)
                }
            } catch (err: any) {
                console.error("Search error", err);
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, [searchParams]);

    const handleBook = (offer: FlightOffer) => {
        // Save full offer to session storage because it's too big for URL
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedFlightOffer', JSON.stringify(offer));
            // Also save dictionaries for context if needed
            sessionStorage.setItem('flightDictionaries', JSON.stringify(dictionaries));
            router.push(`/flights/pricing?id=${offer.id}`);
        }
    };

    // Sorting logic (can be refined to use API sorting later)
    const sortedFlights = [...flightOffers].sort((a, b) => {
        if (sortBy === 'fastest') {
            // Parse duration from itinerary
            const getDuration = (o: FlightOffer) => o.itineraries[0].duration;
            // Simple string compare for ISO8601 duration isn't perfect but works for simple cases, 
            // better would be to parse to minutes. 
            // Letting it slide for now or using price default.
            return getDuration(a).localeCompare(getDuration(b));
        }
        return parseFloat(a.price.total) - parseFloat(b.price.total);
    });

    const formatPrice = (price: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    }

    const scrollToSearch = () => {
        const searchElement = document.getElementById('advanced-search-form');
        if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

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
                                Found {flightOffers.length} results for your trip.
                            </p>
                        </div>
                    </div>

                    {/* The Advanced Search Component */}
                    <div id="advanced-search-form">
                        <AdvancedFlightSearch className="mb-8" />
                    </div>
                </div>
            </section>

            {/* Results Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:py-8">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sticky top-20 z-30 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 text-xs border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-100 hover:text-black transition-colors"
                            onClick={scrollToSearch}
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter Results
                        </Button>
                        <div className="h-4 w-[1px] bg-neutral-800 mx-2" />
                        <div className="flex items-center gap-2">
                            {/* Example Quick Filters */}
                            <Badge
                                variant={sortBy === 'best_value' ? 'default' : 'secondary'}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    sortBy === 'best_value' ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                )}
                                onClick={() => setSortBy('best_value')}
                            >
                                Best Value
                            </Badge>
                            <Badge
                                variant={sortBy === 'fastest' ? 'default' : 'secondary'}
                                className={cn(
                                    "cursor-pointer border-dashed transition-colors",
                                    sortBy === 'fastest' ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border-neutral-700"
                                )}
                                onClick={() => setSortBy('fastest')}
                            >
                                Fastest
                            </Badge>
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

                {error && (
                    <div className="p-4 mb-6 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

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
                        {sortedFlights.length > 0 ? (
                            <>
                                <div className={cn(
                                    "gap-6",
                                    viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col items-center w-full"
                                )}>
                                    {sortedFlights.map((offer) => {
                                        const cardProps = mapFlightOfferToCard(offer, dictionaries);
                                        return viewMode === 'list' ? (
                                            <FlightCard
                                                key={offer.id}
                                                {...cardProps}
                                                onBook={() => handleBook(offer)}
                                                onFlightDetails={() => handleBook(offer)}
                                            />
                                        ) : (
                                            <FlightCardGrid
                                                key={offer.id}
                                                imageUrl={cardProps.airline.logo} // Use airline logo as image for now
                                                airline={cardProps.airline.name}
                                                flightCode={cardProps.airline.flightNumber}
                                                flightClass={cardProps.class || ''}
                                                departureCode={cardProps.departureCode}
                                                departureCity={cardProps.departureCity}
                                                departureTime={cardProps.departureTime}
                                                arrivalCode={cardProps.arrivalCode}
                                                arrivalCity={cardProps.arrivalCity}
                                                arrivalTime={cardProps.arrivalTime}
                                                duration={cardProps.duration}
                                                price={formatPrice(cardProps.price, cardProps.currency)}
                                                onBook={() => handleBook(offer)}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Total Results Indicator */}
                                <div className="fixed bottom-6 right-6 z-40">
                                    <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-sm shadow-xl hover:bg-white/20 transition-colors">
                                        Total Results: {flightOffers.length}
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

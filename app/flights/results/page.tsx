'use client';

import Navbar from '@/components/ui/navbar';
import FooterSection from '@/components/ui/footer-section';
import AdvancedFlightSearch from '@/components/advanced-flight-search';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function FlightResultsContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    // Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500 mb-2">
                            Select Your Flight
                        </h1>
                        <p className="text-neutral-400 max-w-2xl">
                            We found the best connections for you. Use the filters below to refine your search.
                        </p>
                    </div>

                    {/* The Advanced Search Component */}
                    <AdvancedFlightSearch />
                </div>
            </section>

            {/* Results Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:py-12">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full h-32 bg-neutral-900/50 rounded-lg animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">✈️</span>
                        </div>
                        <h3 className="text-xl font-medium text-white">No Flights Found (Demo)</h3>
                        <p className="text-neutral-500 max-w-md">
                            Note: This is a frontend integration demo. In a real application, this would fetch live data from the Amadeus API using the params from the form above.
                        </p>
                        <div className="p-4 bg-neutral-900/30 border border-white/10 rounded-md text-left text-xs font-mono text-neutral-400 max-w-lg w-full mt-4">
                            <p className="mb-2 font-semibold text-white">Search Params:</p>
                            {Array.from(searchParams.entries()).length > 0 ? (
                                Array.from(searchParams.entries()).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b border-white/5 py-1 last:border-0">
                                        <span>{key}:</span>
                                        <span className="text-green-400">{value}</span>
                                    </div>
                                ))
                            ) : (
                                <p>No URL parameters detected.</p>
                            )}
                        </div>
                    </div>
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

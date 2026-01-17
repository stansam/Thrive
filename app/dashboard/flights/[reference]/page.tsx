'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import useSWR from 'swr';
import { tokenManager } from '@/lib/auth/token-manager';

// Components
import { BookingHeader } from '@/components/dashboard/flights/BookingHeader';
import { BookingTimeline } from '@/components/dashboard/flights/BookingTimeline';
import { PricingCards } from '@/components/dashboard/flights/PricingCards';
import { BookingDocuments } from '@/components/dashboard/flights/BookingDocuments';
import { BookingUpdates } from '@/components/dashboard/flights/BookingUpdates';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Fetcher function
const fetcher = async (url: string) => {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
};

export default function FlightBookingPage() {
    const params = useParams();
    const router = useRouter();
    const reference = params?.reference as string;

    const { data: response, error, isLoading } = useSWR(
        reference ? `/api/dashboard/flights/${reference}` : null,
        fetcher
    );

    const booking = response?.data;

    // Loading State
    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                <div className="h-40 w-full bg-muted animate-pulse rounded-lg" />
                <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
            </div>
        );
    }

    // Error State
    if (error || !booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-xl font-semibold">Booking not found</h2>
                <p className="text-muted-foreground">This booking may not exist or you do not have permission to view it.</p>
                <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 max-w-7xl">
            {/* Navigation */}
            <Button variant="ghost" onClick={() => router.back()} className="gap-2 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Button>

            {/* 1. Header */}
            <BookingHeader
                bookingReference={booking.booking_reference}
                status={booking.status}
                airlineName={booking.flight_details.airline_name}
                origin={booking.flight_details.origin}
                destination={booking.flight_details.destination}
                departureDate={booking.flight_details.departure_date}
                returnDate={booking.flight_details.return_date}
            />

            {/* 2. Timeline */}
            <BookingTimeline status={booking.status} />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Flight Info & Passengers */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Flight Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Flight Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Flight Number</p>
                                    <p className="font-medium">{booking.flight_details.flight_numbers.join(', ')}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Class</p>
                                    <p className="font-medium capitalize">{booking.flight_details.cabin_class}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground">Passenger Limit</p>
                                    <p className="font-medium text-destructive">Names must match passport exactly.</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-medium mb-3">Passengers</h4>
                                <div className="space-y-2">
                                    {booking.passengers.map((p: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-muted/40 rounded-md">
                                            <span className="font-medium">{p.full_name}</span>
                                            <span className="text-xs bg-background border px-2 py-1 rounded">
                                                {p.passenger_type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing Section (Split) */}
                    <PricingCards
                        serviceFee={booking.pricing.service_fee}
                        airlineFare={booking.pricing.airline_fare}
                    />
                </div>

                {/* Right Column: Docs & Updates */}
                <div className="space-y-8">
                    {/* Documents */}
                    <BookingDocuments documents={booking.documents} />

                    {/* Updates */}
                    <BookingUpdates activityLog={booking.activity_log} />

                    {/* Contact CTA */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">Need Help?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Our concierge team is available to assist with any changes or questions.
                            </p>
                            <Button className="w-full gap-2" asChild>
                                <a
                                    href={`https://wa.me/1234567890?text=${encodeURIComponent(`Hello Thrive Team, I need assistance with booking ${booking.booking_reference}`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Contact Support
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

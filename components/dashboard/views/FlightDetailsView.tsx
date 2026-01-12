
"use client"

import { useFlightDetails } from '@/lib/hooks/use-flights-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plane, FileText, CreditCard, MessageSquare, Download, AlertTriangle } from 'lucide-react';

export default function FlightDetailsView({ bookingId, onBack }: { bookingId: string, onBack: () => void }) {
    const { booking, isLoading, isError } = useFlightDetails(bookingId);

    if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>;
    if (isError || !booking) return <div className="text-red-500">Error loading booking details. <Button onClick={onBack}>Back</Button></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Booking {booking.pnr || booking.booking_reference}
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                        </Badge>
                    </h2>
                    <p className="text-muted-foreground">Managed by Thrive Concierge</p>
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details & Itinerary</TabsTrigger>
                    <TabsTrigger value="payment">Payment & Invoice</TabsTrigger>
                    <TabsTrigger value="tracking">Tracking & Support</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flight Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Segments (Mocked loop if segments exist, else single) */}
                            <div className="flex flex-col gap-4 border-l-2 border-neutral-200 dark:border-neutral-800 pl-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-lg">{booking.origin} → {booking.destination}</div>
                                        <div className="text-sm text-muted-foreground">{booking.airline} • {booking.flight_number}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{new Date(booking.departure_date).toLocaleDateString()}</div>
                                        <div className="text-sm text-muted-foreground">{new Date(booking.departure_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Passengers</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" /> E-Ticket
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {booking.passengers?.map((p: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <div className="font-medium">{p.first_name} {p.last_name}</div>
                                        <div className="text-sm text-muted-foreground">{p.type}</div>
                                    </div>
                                )) || <div className="text-muted-foreground">No passenger info available.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Base Price</span>
                                    <span>{booking.currency} {booking.base_price?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes</span>
                                    <span>{booking.currency} {booking.taxes?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>{booking.currency} {booking.total_price?.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <Button className="flex-1">Download Invoice</Button>
                                <Button variant="outline" className="flex-1">Download Receipt</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tracking Tab */}
                <TabsContent value="tracking" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Changes</CardTitle>
                            <CardDescription>Need to modify your booking? Request changes here.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                <FileText className="h-5 w-5" />
                                <span>Change Date</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                <Plane className="h-5 w-5" />
                                <span>Reroute</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                <MessageSquare className="h-5 w-5" />
                                <span>Contact Support</span>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-primary h-2 w-2 rounded-full" />
                                    <div>
                                        <div className="font-medium">Booking Confirmed</div>
                                        <div className="text-sm text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

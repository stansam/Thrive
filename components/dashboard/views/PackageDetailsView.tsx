
"use client"

import { usePackageDetails } from '@/lib/hooks/use-packages-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Calendar, FileText, Download } from 'lucide-react';

export default function PackageDetailsView({ bookingId, onBack }: { bookingId: string, onBack: () => void }) {
    const { booking, isLoading, isError } = usePackageDetails(bookingId);

    if (isLoading) return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>;
    if (isError || !booking) return <div className="text-red-500">Error loading package details. <Button onClick={onBack}>Back</Button></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {booking.package?.name || booking.booking_reference}
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                        </Badge>
                    </h2>
                    <p className="text-muted-foreground">{booking.destination_city}, {booking.destination_country}</p>
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details & Itinerary</TabsTrigger>
                    <TabsTrigger value="payments">Payments & Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6 space-y-4">
                    {/* Itinerary */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Itinerary</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{new Date(booking.departure_date).toLocaleDateString()} - {new Date(booking.return_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="space-y-6 border-l-2 border-dashed border-neutral-200 dark:border-neutral-800 ml-2 pl-6">
                                {/* Mock Itinerary */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary" />
                                    <h4 className="font-semibold">Day 1: Arrival</h4>
                                    <p className="text-sm text-muted-foreground">Transfer to hotel and welcome dinner.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                    <h4 className="font-semibold">Day 2: City Tour</h4>
                                    <p className="text-sm text-muted-foreground">Guided tour of the city highlights.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center py-4 border-b">
                                <div>
                                    <div className="font-medium">Total Amount</div>
                                    <div className="text-sm text-muted-foreground">Paid on {new Date(booking.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="text-xl font-bold">${booking.total_price}</div>
                            </div>
                            <Button className="mt-4 w-full md:w-auto">Download Invoice</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

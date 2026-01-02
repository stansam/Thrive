"use client"

/**
 * My Trips & Tours Tab Component
 * Displays package tour bookings with details and itineraries
 */

import { useState } from 'react';
import { useTrips, useTripDetails } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Users, Star, Hotel, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Trip } from '@/lib/types/dashboard';

function TripCard({ trip, onViewDetails }: {
    trip: Trip;
    onViewDetails: () => void;
}) {
    const statusColors: Record<string, string> = {
        confirmed: 'bg-green-500',
        pending: 'bg-yellow-500',
        cancelled: 'bg-red-500',
        completed: 'bg-blue-500',
    };

    return (
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
            {trip.package?.featuredImage && (
                <div className="h-48 w-full overflow-hidden">
                    <img
                        src={trip.package.featuredImage}
                        alt={trip.package.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{trip.package?.name || 'Package Tour'}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trip.package?.destination || 'Destination'}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                        <div className={`h-2 w-2 rounded-full ${statusColors[trip.status] || 'bg-gray-500'} mr-1`} />
                        {trip.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Duration */}
                    {trip.package?.duration && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{trip.package.duration}</span>
                        </div>
                    )}

                    {/* Departure Date */}
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                            Departs: {format(new Date(trip.departureDate), 'MMM dd, yyyy')}
                        </span>
                    </div>

                    {/* Hotel */}
                    {trip.package?.hotelName && (
                        <div className="flex items-center gap-2 text-sm">
                            <Hotel className="h-4 w-4 text-muted-foreground" />
                            <span>{trip.package.hotelName}</span>
                            {trip.package.hotelRating && (
                                <div className="flex items-center">
                                    {[...Array(trip.package.hotelRating)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Passengers */}
                    {trip.passengers && trip.passengers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{trip.passengers.length} Traveler{trip.passengers.length > 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Total Price</span>
                        <span className="text-lg font-bold">${trip.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Actions */}
                    <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full">
                        View Full Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyTripsTab() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const { trips, pagination, isLoading, isError, error } = useTrips({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        perPage: 9,
    });

    const { trip: selectedTrip } = useTripDetails(selectedTripId);

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load trips. {error?.message || 'Please try again later.'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Trips</CardTitle>
                    <CardDescription>View your active and past package tours</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Trips</SelectItem>
                                    <SelectItem value="active">Active Trips</SelectItem>
                                    <SelectItem value="past">Past Trips</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Trips Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-48 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : trips && trips.length > 0 ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {trips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                onViewDetails={() => setSelectedTripId(trip.id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MapPin className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium">No trips found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Book a package tour to see it here
                        </p>
                        <Button className="mt-4">Explore Packages</Button>
                    </CardContent>
                </Card>
            )}

            {/* Trip Details Dialog */}
            <Dialog open={!!selectedTripId} onOpenChange={() => setSelectedTripId(null)}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedTrip?.package?.name || 'Trip Details'}</DialogTitle>
                        <DialogDescription>
                            Booking Reference: {selectedTrip?.bookingReference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTrip && (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                                <TabsTrigger value="travelers">Travelers</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                {/* Package Images */}
                                {selectedTrip.package?.galleryImages && selectedTrip.package.galleryImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedTrip.package.galleryImages.slice(0, 6).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Gallery ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                {selectedTrip.package?.description && (
                                    <div>
                                        <Label className="text-muted-foreground mb-2 block">Description</Label>
                                        <p className="text-sm">{selectedTrip.package.description}</p>
                                    </div>
                                )}

                                {/* Highlights */}
                                {selectedTrip.package?.highlights && selectedTrip.package.highlights.length > 0 && (
                                    <div>
                                        <Label className="text-muted-foreground mb-2 block">Highlights</Label>
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedTrip.package.highlights.map((highlight, idx) => (
                                                <li key={idx} className="text-sm">{highlight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Inclusions */}
                                {selectedTrip.package?.inclusions && selectedTrip.package.inclusions.length > 0 && (
                                    <div>
                                        <Label className="text-muted-foreground mb-2 block">Inclusions</Label>
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedTrip.package.inclusions.map((item, idx) => (
                                                <li key={idx} className="text-sm text-green-600">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Exclusions */}
                                {selectedTrip.package?.exclusions && selectedTrip.package.exclusions.length > 0 && (
                                    <div>
                                        <Label className="text-muted-foreground mb-2 block">Exclusions</Label>
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedTrip.package.exclusions.map((item, idx) => (
                                                <li key={idx} className="text-sm text-red-600">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="itinerary" className="space-y-4">
                                {selectedTrip.package?.itinerary && selectedTrip.package.itinerary.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedTrip.package.itinerary.map((day: any, idx: number) => (
                                            <Card key={idx}>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Day {idx + 1}: {day.title || 'Itinerary'}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm">{day.description || day.activities?.join(', ')}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No itinerary details available
                                    </p>
                                )}
                            </TabsContent>

                            <TabsContent value="travelers" className="space-y-4">
                                {selectedTrip.passengers && selectedTrip.passengers.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedTrip.passengers.map((passenger, idx) => (
                                            <Card key={idx}>
                                                <CardContent className="flex items-center justify-between p-4">
                                                    <div>
                                                        <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                                                        <p className="text-sm text-muted-foreground capitalize">{passenger.passengerType}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No traveler information available
                                    </p>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client"

/**
 * My Bookings Tab Component
 * Displays user bookings with filters, pagination, and management options
 */

import { useState } from 'react';
import { useBookings, useBookingDetails, useCancelBooking } from '@/lib/hooks/use-dashboard-api';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plane, Calendar, Users, DollarSign, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Booking } from '@/lib/types/dashboard';

function BookingCard({ booking, onViewDetails, onCancel }: {
    booking: Booking;
    onViewDetails: () => void;
    onCancel: () => void;
}) {
    const statusColors: Record<string, string> = {
        confirmed: 'bg-green-500',
        pending: 'bg-yellow-500',
        cancelled: 'bg-red-500',
        completed: 'bg-blue-500',
        refunded: 'bg-purple-500',
    };

    const canCancel = booking.status === 'confirmed' || booking.status === 'pending';

    const bookingType =
        booking?.bookingType
            ? booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)
            : "General";

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{booking.bookingReference}</CardTitle>
                        <CardDescription className="mt-1">
                            {bookingType} Booking
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                        <div className={`h-2 w-2 rounded-full ${statusColors[booking.status] || 'bg-gray-500'} mr-1`} />
                        {booking.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Route */}
                    {booking.origin && booking.destination && (
                        <div className="flex items-center gap-2 text-sm">
                            <Plane className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.origin} → {booking.destination}</span>
                        </div>
                    )}

                    {/* Dates */}
                    {booking.departureDate && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {format(new Date(booking.departureDate), 'MMM dd, yyyy')}
                                {booking.returnDate && ` - ${format(new Date(booking.returnDate), 'MMM dd, yyyy')}`}
                            </span>
                        </div>
                    )}

                    {/* Passengers */}
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                            {booking.numAdults} Adult{booking.numAdults > 1 ? 's' : ''}
                            {booking.numChildren > 0 && `, ${booking.numChildren} Child${booking.numChildren > 1 ? 'ren' : ''}`}
                            {booking.numInfants > 0 && `, ${booking.numInfants} Infant${booking.numInfants > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${booking?.totalPrice != null ? booking.totalPrice.toFixed(2) : "0.00"}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
                            View Details
                        </Button>
                        {canCancel && (
                            <Button variant="destructive" size="sm" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyBookingsTab() {
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        page: 1,
        perPage: 9,
    });

    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [requestRefund, setRequestRefund] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    const { bookings, pagination, isLoading, isError, error, refresh } = useBookings(filters);
    const { booking: selectedBooking } = useBookingDetails(selectedBookingId);
    const { cancelBooking } = useCancelBooking();

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleCancelBooking = async () => {
        if (!cancelBookingId || !cancelReason.trim()) return;

        setIsCancelling(true);
        try {
            await cancelBooking(cancelBookingId, {
                reason: cancelReason,
                requestRefund,
            });

            setCancelBookingId(null);
            setCancelReason('');
            setRequestRefund(true);
            refresh();
        } catch (err: any) {
            alert(err?.message || 'Failed to cancel booking');
        } finally {
            setIsCancelling(false);
        }
    };

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load bookings. {error?.message || 'Please try again later.'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Bookings</CardTitle>
                    <CardDescription>Refine your search to find specific bookings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="flight">Flight</SelectItem>
                                    <SelectItem value="package">Package</SelectItem>
                                    <SelectItem value="hotel">Hotel</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Per Page</Label>
                            <Select value={filters.perPage.toString()} onValueChange={(value) => handleFilterChange('perPage', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 per page</SelectItem>
                                    <SelectItem value="9">9 per page</SelectItem>
                                    <SelectItem value="12">12 per page</SelectItem>
                                    <SelectItem value="24">24 per page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-9 w-full mt-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : bookings && bookings.length > 0 ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onViewDetails={() => setSelectedBookingId(booking.id)}
                                onCancel={() => setCancelBookingId(booking.id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
                                {Math.min(pagination.page * pagination.perPage, pagination.totalItems)} of{' '}
                                {pagination.totalItems} bookings
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
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
                        <Plane className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium">No bookings found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Try adjusting your filters or book your first trip
                        </p>
                        <Button className="mt-4">Browse Destinations</Button>
                    </CardContent>
                </Card>
            )}

            {/* Booking Details Dialog */}
            <Dialog open={!!selectedBookingId} onOpenChange={() => setSelectedBookingId(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedBooking?.bookingReference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-4">
                            {/* Booking Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <p className="font-medium capitalize">{selectedBooking.status}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Type</Label>
                                    <p className="font-medium capitalize">{selectedBooking.bookingType}</p>
                                </div>
                                {selectedBooking.origin && (
                                    <div>
                                        <Label className="text-muted-foreground">From</Label>
                                        <p className="font-medium">{selectedBooking.origin}</p>
                                    </div>
                                )}
                                {selectedBooking.destination && (
                                    <div>
                                        <Label className="text-muted-foreground">To</Label>
                                        <p className="font-medium">{selectedBooking.destination}</p>
                                    </div>
                                )}
                            </div>

                            {/* Passengers */}
                            {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground mb-2 block">Passengers</Label>
                                    <div className="space-y-2">
                                        {selectedBooking.passengers.map((passenger, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                                <span>{passenger.firstName} {passenger.lastName}</span>
                                                <Badge variant="outline" className="capitalize">{passenger.passengerType}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div>
                                <Label className="text-muted-foreground mb-2 block">Price Breakdown</Label>
                                <div className="space-y-2 border rounded p-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Base Price</span>
                                        <span>${selectedBooking?.basePrice != null ? selectedBooking.basePrice.toFixed(2) : "0.00"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Service Fee</span>
                                        <span>${selectedBooking?.serviceFee != null ? selectedBooking.serviceFee.toFixed(2) : "0.00"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Taxes</span>
                                        <span>${selectedBooking?.taxes != null ? selectedBooking.taxes.toFixed(2) : "0.00"}</span>
                                    </div>
                                    {selectedBooking.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-${selectedBooking?.discount != null ? selectedBooking.discount.toFixed(2) : "0.00"}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>${selectedBooking?.totalPrice != null ? selectedBooking.totalPrice.toFixed(2) : "0.00"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <AlertDialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for cancellation. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Cancellation Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Change of plans, Found better option..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="refund"
                                checked={requestRefund}
                                onChange={(e) => setRequestRefund(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="refund" className="text-sm font-normal">
                                Request refund (subject to cancellation policy)
                            </Label>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelBooking}
                            disabled={isCancelling || !cancelReason.trim()}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

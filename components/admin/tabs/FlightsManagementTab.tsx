"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookings, useBooking, useUpdateBooking, useCancelBooking } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Ban, ChevronLeft, ChevronRight, MoreHorizontal, Calendar } from "lucide-react";
import type { AdminBooking } from "@/lib/types/admin.d.ts";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function FlightsManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editForm, setEditForm] = useState<any>({});
    const { toast } = useToast();
    const [cancelReason, setCancelReason] = useState("");

    const { bookings, pagination, isLoading, refresh } = useBookings({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
        bookingType: "flight",
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
    });

    const { booking: selectedBooking, isLoading: loadingBooking } = useBooking(selectedBookingId);
    const { booking: editingBooking, isLoading: loadingEditBooking } = useBooking(editingBookingId);
    const { updateBooking, isLoading: updating } = useUpdateBooking();
    const { cancelBooking, isLoading: cancelling } = useCancelBooking();

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            completed: "bg-blue-100 text-blue-800",
            refunded: "bg-purple-100 text-purple-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const handleUpdateBooking = async () => {
        if (!editingBookingId) return;

        try {
            await updateBooking(editingBookingId, editForm);
            setEditingBookingId(null);
            setEditForm({});
            refresh();
            toast({
                title: "Booking Updated",
                description: "The flight booking status has been updated.",
            });
        } catch (error: any) {
            console.error("Failed to update booking", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update the booking. Please try again.",
            });
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelBookingId || !cancelReason.trim()) return;

        try {
            await cancelBooking(cancelBookingId, cancelReason);
            setCancelBookingId(null);
            setCancelReason("");
            refresh();
            toast({
                title: "Booking Cancelled",
                description: "The flight booking has been successfully cancelled.",
            });
        } catch (error: any) {
            console.error("Failed to cancel booking", error);
            toast({
                variant: "destructive",
                title: "Cancellation Failed",
                description: "Could not cancel the booking. Please try again.",
            });
        }
    };

    const openEditModal = (booking: AdminBooking) => {
        setEditingBookingId(booking.id);
        setEditForm({
            status: booking.status,
            notes: "",
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-end">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bookings Table Card */}
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Flight Bookings</CardTitle>
                    <CardDescription>
                        Manage flight reservations and passenger details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Reference</TableHead>
                                <TableHead className="w-[200px]">Customer</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : bookings?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No flight bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings?.map((booking: AdminBooking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                            {booking.booking_reference}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{booking.customer?.fullName || "N/A"}</div>
                                            <div className="text-xs text-muted-foreground">{booking.customer?.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Badge variant="outline" className="font-normal">{booking.origin}</Badge>
                                                <span className="text-muted-foreground">→</span>
                                                <Badge variant="outline" className="font-normal">{booking.destination}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {booking.departure_date ? format(new Date(booking.departure_date), "MMM d, yyyy") : "N/A"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`hover:bg-opacity-80 border-none shadow-none ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${booking.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setSelectedBookingId(booking.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(booking)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Update Status
                                                    </DropdownMenuItem>
                                                    {(booking.status === "pending" || booking.status === "confirmed") && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => setCancelBookingId(booking.id)}
                                                            >
                                                                <Ban className="mr-2 h-4 w-4" /> Cancel Booking
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Pagination Footer */}
                {
                    pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> pages
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )
                }
            </Card>

            {/* View Booking Dialog */}
            <Dialog open={!!selectedBookingId} onOpenChange={() => setSelectedBookingId(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Flight Booking Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedBooking?.booking_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {loadingBooking ? (
                        <div className="space-y-4 py-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : selectedBooking ? (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge className={`capitalize mt-1 ${getStatusColor(selectedBooking.status)}`}>
                                            {selectedBooking.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Type</Label>
                                    <p className="font-medium capitalize">{selectedBooking.booking_type}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Origin</Label>
                                    <p className="font-medium text-lg">{selectedBooking.origin || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Destination</Label>
                                    <p className="font-medium text-lg">{selectedBooking.destination || "N/A"}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Name</Label>
                                        <p className="font-medium">{selectedBooking.customer?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <p className="font-medium">{selectedBooking.customer?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Payment Summary</h4>
                                <div className="bg-muted min-w-[250px] p-4 rounded-lg inline-block">
                                    <div className="text-sm text-muted-foreground">Total Amount</div>
                                    <div className="text-2xl font-bold">${selectedBooking.total_price.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Edit Booking Dialog */}
            <Dialog open={!!editingBookingId} onOpenChange={() => setEditingBookingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Booking</DialogTitle>
                        <DialogDescription>
                            Modify booking status.
                        </DialogDescription>
                    </DialogHeader>
                    {loadingEditBooking ? (
                        <div className="space-y-4 py-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : editingBooking ? (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : null}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingBookingId(null)}>Cancel</Button>
                        <Button onClick={handleUpdateBooking} disabled={updating}>
                            {updating ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Alert Dialog */}
            <AlertDialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Flight Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancel-reason" className="mb-2 block">Cancellation Reason (Required)</Label>
                        <Textarea
                            id="cancel-reason"
                            placeholder="e.g., Customer request, flight unavailable..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCancelReason("")}>
                            Keep Booking
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelBooking}
                            disabled={!cancelReason.trim() || cancelling}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

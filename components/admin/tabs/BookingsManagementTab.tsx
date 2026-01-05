"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookings, useBooking, useUpdateBooking } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminBooking } from "@/lib/types/admin.d.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [cancelReason, setCancelReason] = useState("");

    const { bookings, pagination, isLoading, refresh } = useBookings({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
    });

    const { booking: selectedBooking, isLoading: loadingBooking } = useBooking(selectedBookingId);
    const { booking: editingBooking, isLoading: loadingEditBooking } = useBooking(editingBookingId);
    const { updateBooking, isLoading: updating } = useUpdateBooking();

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
            alert("Booking updated successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to update booking");
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelBookingId || !cancelReason.trim()) return;

        try {
            // Use the cancel endpoint
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/bookings/${cancelBookingId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reason: cancelReason }),
                }
            );

            if (!response.ok) throw new Error("Failed to cancel booking");

            setCancelBookingId(null);
            setCancelReason("");
            refresh();
            alert("Booking cancelled successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to cancel booking");
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
        <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px]">
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
            </Card>

            {/* Bookings Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Reference
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Route
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-6 py-4">
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : bookings?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                bookings?.map((booking: AdminBooking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {booking.booking_reference}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking.customer?.fullName || "N/A"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.customer?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {booking.origin} → {booking.destination}
                                        </td>
                                        <td className="px-6 py-4 text-sm capitalize">{booking.booking_type}</td>
                                        <td className="px-6 py-4">
                                            <Badge className={`capitalize ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${booking.total_price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedBookingId(booking.id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(booking)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                {(booking.status === "pending" || booking.status === "confirmed") && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setCancelBookingId(booking.id)}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page {page} of {pagination.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Booking Details Modal */}
            <Dialog open={!!selectedBookingId} onOpenChange={() => setSelectedBookingId(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedBooking?.booking_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {loadingBooking ? (
                        <Skeleton className="h-64 w-full" />
                    ) : selectedBooking ? (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Status</Label>
                                    <Badge className={`capitalize ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Type</Label>
                                    <p className="font-medium capitalize">{selectedBooking.booking_type}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Origin</Label>
                                    <p className="font-medium">{selectedBooking.origin || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Destination</Label>
                                    <p className="font-medium">{selectedBooking.destination || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Departure Date</Label>
                                    <p className="font-medium">
                                        {selectedBooking.departure_date
                                            ? new Date(selectedBooking.departure_date).toLocaleDateString()
                                            : "N/A"}
                                    </p>
                                </div>
                                {selectedBooking.return_date && (
                                    <div>
                                        <Label className="text-gray-600">Return Date</Label>
                                        <p className="font-medium">
                                            {new Date(selectedBooking.return_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <p className="font-medium">{selectedBooking.customer?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Email</Label>
                                        <p className="font-medium">{selectedBooking.customer?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Passengers */}
                            {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Passengers</h3>
                                    <div className="space-y-2">
                                        {selectedBooking.passengers.map((passenger: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                                <span>{passenger.firstName} {passenger.lastName}</span>
                                                <Badge variant="outline" className="capitalize">{passenger.passengerType}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Price Breakdown</h3>
                                <div className="space-y-2 bg-gray-50 p-4 rounded">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span>${selectedBooking.total_price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payments */}
                            {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Payment History</h3>
                                    <div className="space-y-2">
                                        {selectedBooking.payments.map((payment: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                                <div>
                                                    <p className="font-medium">{payment.payment_reference}</p>
                                                    <p className="text-sm text-gray-500">${payment.amount.toFixed(2)}</p>
                                                </div>
                                                <Badge className="capitalize">{payment.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Edit Booking Modal */}
            <Dialog open={!!editingBookingId} onOpenChange={() => setEditingBookingId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Booking</DialogTitle>
                        <DialogDescription>
                            Modify booking status and add admin notes
                        </DialogDescription>
                    </DialogHeader>
                    {loadingEditBooking ? (
                        <Skeleton className="h-48 w-full" />
                    ) : editingBooking ? (
                        <div className="space-y-4">
                            <div>
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

                            <div>
                                <Label>Admin Notes</Label>
                                <Textarea
                                    placeholder="Add internal notes about this booking..."
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingBookingId(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateBooking}
                                    disabled={updating}
                                    className="flex-1"
                                >
                                    {updating ? "Updating..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <AlertDialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Provide a reason for cancellation. This action will update the booking status.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder="e.g., Customer request, flight unavailable..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCancelReason("")}>
                            Keep Booking
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelBooking}
                            disabled={!cancelReason.trim()}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Cancel Booking
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBookings, useUpdateBooking, useCancelBooking } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Ban, ChevronLeft, ChevronRight, MoreHorizontal, Plane, Calendar, User, FileText, CreditCard } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link"; // For linking to Mission Control

// Helper to convert array to newline-separated string
const arrayToText = (arr?: string[]) => (arr ? arr.join("\n") : "");
// Helper to convert newline-separated string to array
const textToArray = (text: string) => text.split("\n").filter((line) => line.trim() !== "");


export default function BookingsManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [bookingTypeFilter, setBookingTypeFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editForm, setEditForm] = useState<any>({});

    const { toast } = useToast();

    const { bookings, pagination, isLoading, refresh } = useBookings({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
        bookingType: bookingTypeFilter === "all" ? "" : bookingTypeFilter,
        search,
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
    });

    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
    const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null);

    const { updateBooking, isLoading: isUpdating } = useUpdateBooking();
    const { cancelBooking, isLoading: isCancelling } = useCancelBooking();

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
            // Prepare payload with corrected types
            const payload = {
                ...editForm,
                basePrice: parseFloat(editForm.basePrice) || 0,
                serviceFee: parseFloat(editForm.serviceFee) || 0,
                taxes: parseFloat(editForm.taxes) || 0,
                discount: parseFloat(editForm.discount) || 0,
                ticketNumbers: textToArray(editForm.ticketNumbersStr || "")
            };
            delete payload.ticketNumbersStr;

            await updateBooking(editingBookingId, payload);
            setEditingBookingId(null);
            setEditForm({});
            refresh();
            toast({
                title: "Booking Updated",
                description: "The booking details have been successfully updated.",
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
        if (!cancellingBookingId || !cancelReason.trim()) return;

        try {
            await cancelBooking(cancellingBookingId, cancelReason);
            setCancellingBookingId(null);
            setCancelReason("");
            refresh();
            toast({
                title: "Booking Cancelled",
                description: "The booking has been successfully cancelled.",
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

    const openViewModal = (booking: AdminBooking) => {
        setSelectedBookingId(booking.id);
        setSelectedBooking(booking);
    };

    const openEditModal = (booking: AdminBooking) => {
        setEditingBookingId(booking.id);
        setEditingBooking(booking);
        setEditForm({
            status: booking.status,
            notes: booking.notes || "",
            airline: booking.airline || "",
            flightNumber: booking.flight_number || "",
            airlineConfirmation: booking.airline_confirmation || "",
            ticketNumbersStr: arrayToText(booking.ticket_numbers),
            basePrice: booking.base_price || 0,
            serviceFee: booking.service_fee || 0,
            taxes: booking.taxes || 0,
            discount: booking.discount || 0,
        });
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <Badge className={`hover:bg-opacity-80 border-none shadow-none capitalize ${getStatusColor(status)}`}>
            {status}
        </Badge>
    );

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row justify-between gap-4">
                <Input
                    placeholder="Search by Reference..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="flight">Flight</SelectItem>
                            <SelectItem value="package">Package</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
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
            </div >

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)
                ) : bookings?.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">No bookings found.</div>
                ) : (
                    bookings?.map((booking: AdminBooking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <StatusBadge status={booking.status} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openViewModal(booking)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEditModal(booking)}>
                                                <Edit className="mr-2 h-4 w-4" /> Update Booking
                                            </DropdownMenuItem>
                                            {booking.booking_type === 'flight' && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/flight/${booking.booking_reference}`}>
                                                        <Plane className="mr-2 h-4 w-4" />
                                                        Manage Flight
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            {booking.status !== "cancelled" && (
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setCancellingBookingId(booking.id)}
                                                >
                                                    <Ban className="mr-2 h-4 w-4" /> Cancel Booking
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-base">{booking.booking_reference}</CardTitle>
                                <CardDescription className="flex items-center mt-1 text-xs">
                                    <User className="w-3 h-3 mr-1" /> {booking.customer?.fullName || "Guest"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 text-sm space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center"><Calendar className="w-3 h-3 mr-1" /> Date:</span>
                                    <span>{format(new Date(booking.created_at), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground capitalize flex items-center"><Plane className="w-3 h-3 mr-1" /> Type:</span>
                                    <span className="capitalize">{booking.booking_type}</span>
                                </div>
                                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                                    <span className="text-muted-foreground flex items-center"><CreditCard className="w-3 h-3 mr-1" /> Total:</span>
                                    <span className="font-bold">${booking.total_price.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Bookings</CardTitle>
                    <CardDescription>
                        Manage and track all customer bookings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Reference</TableHead>
                                <TableHead className="w-[200px]">Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Total Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : bookings?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings?.map((booking: AdminBooking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium font-mono">
                                            {booking.booking_reference}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{booking.customer?.fullName || "Guest"}</div>
                                            <div className="text-xs text-muted-foreground">{booking.customer?.email}</div>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {booking.booking_type}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={booking.status} />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(booking.created_at), "MMM d, yyyy")}
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
                                                    <DropdownMenuItem onClick={() => openViewModal(booking)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(booking)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Update Booking
                                                    </DropdownMenuItem>
                                                    {booking.booking_type === 'flight' && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/flight/${booking.booking_reference}`}>
                                                                <Plane className="mr-2 h-4 w-4" />
                                                                Manage Flight
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {booking.status !== "cancelled" && (
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setCancellingBookingId(booking.id)}
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" /> Cancel Booking
                                                        </DropdownMenuItem>
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
                {pagination && pagination.totalPages > 1 && (
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
                )}
            </Card>

            {/* View Booking Dialog */}
            <Dialog open={!!selectedBookingId} onOpenChange={() => setSelectedBookingId(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedBooking?.booking_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Type</Label>
                                    <p className="font-medium capitalize">{selectedBooking.booking_type}</p>
                                </div>
                                {selectedBooking.booking_type === 'flight' && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Route</Label>
                                        <p className="font-medium">{selectedBooking.origin} → {selectedBooking.destination}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                    <div className="mt-1"><StatusBadge status={selectedBooking.status} /></div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Total Price</Label>
                                    <p className="font-medium text-lg">${selectedBooking.total_price.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* PNR & Airline Info */}
                            {selectedBooking.airline_confirmation && (
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <Label className="text-blue-600 text-xs uppercase tracking-wider">Airline PNR</Label>
                                        <p className="font-mono text-xl font-bold text-blue-900">{selectedBooking.airline_confirmation}</p>
                                    </div>
                                    <div className="text-right">
                                        <Label className="text-blue-600 text-xs uppercase tracking-wider">Airline</Label>
                                        <p className="font-medium text-blue-900">{selectedBooking.airline || "N/A"} {selectedBooking.flight_number && `(${selectedBooking.flight_number})`}</p>
                                    </div>
                                </div>
                            )}

                            {/* Ticket Numbers */}
                            {selectedBooking.ticket_numbers && selectedBooking.ticket_numbers.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Issued Tickets</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedBooking.ticket_numbers.map((tkt, i) => (
                                            <Badge key={i} variant="outline" className="font-mono">{tkt}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold mb-3">Customer & Passengers</h4>
                                    <div className="space-y-4">
                                        <div className="bg-card border p-3 rounded">
                                            <Label className="text-xs text-muted-foreground">Booked By</Label>
                                            <p className="font-medium">{selectedBooking.customer?.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{selectedBooking.customer?.email}</p>
                                        </div>
                                        {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Passengers ({selectedBooking.passengers.length})</Label>
                                                {selectedBooking.passengers.map((p: any, i: number) => (
                                                    <div key={i} className="text-sm border-b last:border-0 pb-1">
                                                        {p.first_name} {p.last_name} <span className="text-muted-foreground text-xs">({p.passenger_type})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Financial Breakdown</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Base Price</span>
                                            <span>${(selectedBooking.base_price || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Service Fee</span>
                                            <span>${(selectedBooking.service_fee || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxes</span>
                                            <span>${(selectedBooking.taxes || 0).toFixed(2)}</span>
                                        </div>
                                        {selectedBooking.discount ? (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>-${(selectedBooking.discount).toFixed(2)}</span>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Total</span>
                                            <span>${selectedBooking.total_price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div className="border-t pt-4">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block flex items-center"><FileText className="w-3 h-3 mr-1" /> Admin Notes</Label>
                                    <div className="bg-yellow-50 border border-yellow-100 p-3 rounded text-sm whitespace-pre-wrap text-yellow-900">
                                        {selectedBooking.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Booking Dialog */}
            <Dialog open={!!editingBookingId} onOpenChange={() => setEditingBookingId(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update Booking</DialogTitle>
                        <DialogDescription>
                            Modify booking status, flight details, and financials.
                        </DialogDescription>
                    </DialogHeader>
                    {editingBooking && (
                        <Tabs defaultValue="status" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="status">Status & Notes</TabsTrigger>
                                <TabsTrigger value="flight">Flight Info</TabsTrigger>
                                <TabsTrigger value="finance">Financials</TabsTrigger>
                            </TabsList>

                            <TabsContent value="status" className="space-y-4">
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
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Internal Notes</Label>
                                    <Textarea
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        placeholder="Add valid admin notes..."
                                        rows={6}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="flight" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Airline Name</Label>
                                        <Input
                                            value={editForm.airline}
                                            onChange={(e) => setEditForm({ ...editForm, airline: e.target.value })}
                                            placeholder="e.g. Emirates"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Flight Number</Label>
                                        <Input
                                            value={editForm.flightNumber}
                                            onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value })}
                                            placeholder="e.g. EK123"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Airline PNR (Confirmation)</Label>
                                    <Input
                                        value={editForm.airlineConfirmation}
                                        onChange={(e) => setEditForm({ ...editForm, airlineConfirmation: e.target.value })}
                                        placeholder="e.g. AB12CD"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ticket Numbers (one per line)</Label>
                                    <Textarea
                                        value={editForm.ticketNumbersStr}
                                        onChange={(e) => setEditForm({ ...editForm, ticketNumbersStr: e.target.value })}
                                        placeholder="176-1234567890"
                                        rows={4}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="finance" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Base Price ($)</Label>
                                        <Input
                                            type="number" step="0.01"
                                            value={editForm.basePrice}
                                            onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Service Fee ($)</Label>
                                        <Input
                                            type="number" step="0.01"
                                            value={editForm.serviceFee}
                                            onChange={(e) => setEditForm({ ...editForm, serviceFee: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Taxes ($)</Label>
                                        <Input
                                            type="number" step="0.01"
                                            value={editForm.taxes}
                                            onChange={(e) => setEditForm({ ...editForm, taxes: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Discount ($)</Label>
                                        <Input
                                            type="number" step="0.01"
                                            value={editForm.discount}
                                            onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="bg-muted p-3 rounded text-sm flex justify-between font-medium mt-2">
                                    <span>New Total:</span>
                                    <span>${(
                                        (parseFloat(editForm.basePrice) || 0) +
                                        (parseFloat(editForm.serviceFee) || 0) +
                                        (parseFloat(editForm.taxes) || 0) -
                                        (parseFloat(editForm.discount) || 0)
                                    ).toFixed(2)}</span>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingBookingId(null)}>Cancel</Button>
                        <Button onClick={handleUpdateBooking} disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <AlertDialog open={!!cancellingBookingId} onOpenChange={() => setCancellingBookingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Label>Reason for Cancellation</Label>
                        <Textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Customer request, payment failed, etc..."
                            className="mt-2"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCancelReason("")}>Back</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelBooking}
                            disabled={isCancelling || !cancelReason.trim()}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

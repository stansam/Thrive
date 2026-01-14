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
import { usePayments, useRefundPayment } from "@/lib/hooks/use-admin-api";
import { Eye, DollarSign, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { AdminPayment } from "@/lib/types/admin.d.ts";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

export default function PaymentsManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [refundAmount, setRefundAmount] = useState<string>("");
    const [refundReason, setRefundReason] = useState("");
    const [refundingPaymentId, setRefundingPaymentId] = useState<string | null>(null);
    const { toast } = useToast();

    const { payments, pagination, isLoading, refresh } = usePayments({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
        paymentMethod: paymentMethodFilter === "all" ? "" : paymentMethodFilter,
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
    });

    const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refundPayment, isLoading: isRefunding } = useRefundPayment();

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            paid: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
            refunded: "bg-purple-100 text-purple-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const handleRefund = async () => {
        if (!refundingPaymentId || !refundAmount || !refundReason.trim()) return;

        try {
            const amount = parseFloat(refundAmount);
            await refundPayment(refundingPaymentId, amount, refundReason);
            setRefundingPaymentId(null);
            setRefundAmount("");
            setRefundReason("");
            refresh();
            toast({
                title: "Refund Processed",
                description: "The payment has been successfully refunded.",
            });
        } catch (error: any) {
            console.error("Refund failed", error);
            toast({
                variant: "destructive",
                title: "Refund Failed",
                description: "Could not process the refund. Please try again.",
            });
        }
    };

    const openViewModal = (payment: AdminPayment) => {
        setSelectedPaymentId(payment.id);
        setSelectedPayment(payment);
    };

    const openRefundModal = (payment: AdminPayment) => {
        setRefundingPaymentId(payment.id);
        setRefundAmount(payment.amount.toString());
        setRefundReason("");
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-end">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Methods" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div >

            {/* Payments Table Card */}
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Payments</CardTitle>
                    <CardDescription>
                        Monitor incoming payments and process refunds.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Reference</TableHead>
                                <TableHead className="w-[200px]">Customer</TableHead>
                                <TableHead>Booking Ref</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : payments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments?.map((payment: AdminPayment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.payment_reference}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(payment.created_at), "MMM d, yyyy")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.user?.fullName || "N/A"}</div>
                                            <div className="text-xs text-muted-foreground">{payment.user?.email}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {payment.booking?.reference || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${payment.amount.toFixed(2)} {payment.currency}
                                        </TableCell>
                                        <TableCell className="capitalize text-sm text-muted-foreground">
                                            {payment.payment_method || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`hover:bg-opacity-80 border-none shadow-none ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </Badge>
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
                                                    <DropdownMenuItem onClick={() => openViewModal(payment)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    {payment.status === "paid" && (
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => openRefundModal(payment)}
                                                        >
                                                            <DollarSign className="mr-2 h-4 w-4" /> Process Refund
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

            {/* View Payment Dialog */}
            <Dialog open={!!selectedPaymentId} onOpenChange={() => setSelectedPaymentId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedPayment?.payment_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Amount</Label>
                                        <p className="font-medium text-2xl">
                                            ${selectedPayment.amount.toFixed(2)} <span className="text-sm text-muted-foreground">{selectedPayment.currency}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                        <div>
                                            <Badge className={`mt-1 ${getStatusColor(selectedPayment.status)}`}>
                                                {selectedPayment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Method</Label>
                                        <p className="font-medium capitalize">{selectedPayment.payment_method || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
                                        <p className="font-medium">
                                            {format(new Date(selectedPayment.created_at), "PPP p")}
                                        </p>
                                    </div>
                                    {selectedPayment.booking && (
                                        <div>
                                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Booking Ref</Label>
                                            <p className="font-mono">{selectedPayment.booking.reference}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Name</Label>
                                        <p className="font-medium">{selectedPayment.user?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Email</Label>
                                        <p className="font-medium">{selectedPayment.user?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <AlertDialog open={!!refundingPaymentId} onOpenChange={() => setRefundingPaymentId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Process Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            Issue a refund for this payment. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="refund-amount">Refund Amount ($)</Label>
                            <Input
                                id="refund-amount"
                                type="number"
                                step="0.01"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="refund-reason">Reason for Refund</Label>
                            <Textarea
                                id="refund-reason"
                                placeholder="e.g., Booking cancellation, service issue..."
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setRefundAmount("");
                            setRefundReason("");
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRefund}
                            disabled={!refundAmount || !refundReason.trim()}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Process Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

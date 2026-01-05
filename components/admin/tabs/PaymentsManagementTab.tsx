"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePayments } from "@/lib/hooks/use-admin-api";
import { Eye, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminPayment } from "@/lib/types/admin.d.ts";
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

export default function PaymentsManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");

    const { payments, pagination, isLoading, refresh } = usePayments({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
    });

    const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

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
        if (!refundPaymentId || !refundAmount || !refundReason.trim()) return;

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/payments/${refundPaymentId}/refund`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: parseFloat(refundAmount),
                        reason: refundReason,
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to process refund");

            setRefundPaymentId(null);
            setRefundAmount("");
            setRefundReason("");
            refresh();
            alert("Refund processed successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to process refund");
        }
    };

    const openViewModal = (payment: AdminPayment) => {
        setSelectedPaymentId(payment.id);
        setSelectedPayment(payment);
    };

    const openRefundModal = (payment: AdminPayment) => {
        setRefundPaymentId(payment.id);
        setRefundAmount(payment.amount.toString());
        setRefundReason("");
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
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Payments Table */}
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
                                    Booking
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
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
                            ) : payments?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments?.map((payment: AdminPayment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {payment.payment_reference}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.user?.fullName || "N/A"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.user?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {payment.booking?.reference || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${payment.amount.toFixed(2)} {payment.currency}
                                        </td>
                                        <td className="px-6 py-4 text-sm capitalize text-gray-600">
                                            {payment.payment_method || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`capitalize ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openViewModal(payment)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {payment.status === "paid" && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openRefundModal(payment)}
                                                    >
                                                        <DollarSign className="w-4 h-4" />
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

            {/* View Payment Modal */}
            <Dialog open={!!selectedPaymentId} onOpenChange={() => setSelectedPaymentId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedPayment?.payment_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Amount</Label>
                                    <p className="font-medium text-lg">
                                        ${selectedPayment.amount.toFixed(2)} {selectedPayment.currency}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Status</Label>
                                    <Badge className={getStatusColor(selectedPayment.status)}>
                                        {selectedPayment.status}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Payment Method</Label>
                                    <p className="font-medium capitalize">{selectedPayment.payment_method || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Date</Label>
                                    <p className="font-medium">
                                        {new Date(selectedPayment.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <p className="font-medium">{selectedPayment.user?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Email</Label>
                                        <p className="font-medium">{selectedPayment.user?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedPayment.booking && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Associated Booking</h3>
                                    <p className="text-sm text-gray-600">{selectedPayment.booking.reference}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <AlertDialog open={!!refundPaymentId} onOpenChange={() => setRefundPaymentId(null)}>
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

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuotes, useUpdateQuote } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminQuote } from "@/lib/types/admin.d.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuotesManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const { quotes, pagination, isLoading, refresh } = useQuotes({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
    });

    const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null);
    const [editingQuote, setEditingQuote] = useState<AdminQuote | null>(null);
    const { updateQuote, isLoading: isUpdating } = useUpdateQuote();

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            sent: "bg-blue-100 text-blue-800",
            accepted: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            expired: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const handleUpdateQuote = async () => {
        if (!editingQuoteId) return;

        try {
            await updateQuote(editingQuoteId, editForm);
            setEditingQuoteId(null);
            setEditForm({});
            refresh();
            alert("Quote updated successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to update quote");
        }
    };

    const openViewModal = (quote: AdminQuote) => {
        setSelectedQuoteId(quote.id);
        setSelectedQuote(quote);
    };

    const openEditModal = (quote: AdminQuote) => {
        setEditingQuoteId(quote.id);
        setEditingQuote(quote);
        setEditForm({
            status: quote.status,
            quotedPrice: quote.total_price || 0,
            agentNotes: "",
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
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Quotes Table */}
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
                                    Trip Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Price
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
                            ) : quotes?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No quotes found
                                    </td>
                                </tr>
                            ) : (
                                quotes?.map((quote: AdminQuote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {quote.quote_reference}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {quote.user?.fullName || "N/A"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {quote.user?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {quote.origin} → {quote.destination}
                                        </td>
                                        <td className="px-6 py-4 text-sm capitalize">{quote.trip_type}</td>
                                        <td className="px-6 py-4">
                                            <Badge className={`capitalize ${getStatusColor(quote.status)}`}>
                                                {quote.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {quote.total_price ? `$${quote.total_price.toLocaleString()}` : "Pending"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openViewModal(quote)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(quote)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
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

            {/* View Quote Modal */}
            <Dialog open={!!selectedQuoteId} onOpenChange={() => setSelectedQuoteId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Quote Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedQuote?.quote_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedQuote && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Origin</Label>
                                    <p className="font-medium">{selectedQuote.origin}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Destination</Label>
                                    <p className="font-medium">{selectedQuote.destination}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Trip Type</Label>
                                    <p className="font-medium capitalize">{selectedQuote.trip_type}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Status</Label>
                                    <Badge className={getStatusColor(selectedQuote.status)}>
                                        {selectedQuote.status}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Quoted Price</Label>
                                    <p className="font-medium text-lg">
                                        {selectedQuote.total_price ? `$${selectedQuote.total_price.toFixed(2)}` : "Not set"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Created</Label>
                                    <p className="font-medium">
                                        {new Date(selectedQuote.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <p className="font-medium">{selectedQuote.user?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Email</Label>
                                        <p className="font-medium">{selectedQuote.user?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Quote Modal */}
            <Dialog open={!!editingQuoteId} onOpenChange={() => setEditingQuoteId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Quote</DialogTitle>
                        <DialogDescription>
                            Set pricing and update status for this quote request
                        </DialogDescription>
                    </DialogHeader>
                    {editingQuote && (
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
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Quoted Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.quotedPrice}
                                    onChange={(e) => setEditForm({ ...editForm, quotedPrice: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div>
                                <Label>Agent Notes</Label>
                                <Textarea
                                    placeholder="Add internal notes about pricing, availability, etc..."
                                    value={editForm.agentNotes}
                                    onChange={(e) => setEditForm({ ...editForm, agentNotes: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingQuoteId(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateQuote}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

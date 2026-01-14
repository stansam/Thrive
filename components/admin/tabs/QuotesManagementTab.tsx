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
import { useQuotes, useUpdateQuote } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal, Calendar } from "lucide-react";
import type { AdminQuote } from "@/lib/types/admin.d.ts";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function QuotesManagementTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editForm, setEditForm] = useState<any>({});
    const { toast } = useToast();

    const { quotes, pagination, isLoading, refresh } = useQuotes({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
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
            toast({
                title: "Quote Updated",
                description: "The quote details have been successfully updated.",
            });
        } catch (error: any) {
            console.error("Failed to update quote", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update the quote. Please try again.",
            });
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
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div >

            {/* Quotes Table Card */}
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Quotes</CardTitle>
                    <CardDescription>
                        Review and manage customer quote requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Reference</TableHead>
                                <TableHead className="w-[200px]">Customer</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Trip Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Price</TableHead>
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
                            ) : quotes?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No quotes found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quotes?.map((quote: AdminQuote) => (
                                    <TableRow key={quote.id}>
                                        <TableCell className="font-medium">
                                            {quote.quote_reference}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(quote.created_at), "MMM d, yyyy")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{quote.user?.fullName || "N/A"}</div>
                                            <div className="text-xs text-muted-foreground">{quote.user?.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span className="font-medium">{quote.origin}</span>
                                                <span className="text-muted-foreground">→</span>
                                                <span className="font-medium">{quote.destination}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-sm">
                                            {quote.trip_type}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`hover:bg-opacity-80 border-none shadow-none ${getStatusColor(quote.status)}`}>
                                                {quote.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {quote.total_price ? `$${quote.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Pending"}
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
                                                    <DropdownMenuItem onClick={() => openViewModal(quote)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(quote)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Quote
                                                    </DropdownMenuItem>
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

            {/* View Quote Dialog */}
            <Dialog open={!!selectedQuoteId} onOpenChange={() => setSelectedQuoteId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Quote Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedQuote?.quote_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedQuote && (
                        <div className="space-y-6 py-2">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Origin</Label>
                                        <p className="font-medium text-lg">{selectedQuote.origin}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Trip Type</Label>
                                        <p className="font-medium capitalize">{selectedQuote.trip_type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                        <div>
                                            <Badge className={`mt-1 capitalize ${getStatusColor(selectedQuote.status)}`}>
                                                {selectedQuote.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Destination</Label>
                                        <p className="font-medium text-lg">{selectedQuote.destination}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Quoted Price</Label>
                                        <p className="font-medium text-lg text-primary font-bold">
                                            {selectedQuote.total_price ? `$${selectedQuote.total_price.toFixed(2)}` : "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Requested On</Label>
                                        <p className="font-medium">
                                            {format(new Date(selectedQuote.created_at), "PPP")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Name</Label>
                                        <p className="font-medium">{selectedQuote.user?.fullName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Email</Label>
                                        <p className="font-medium">{selectedQuote.user?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Quote Dialog */}
            <Dialog open={!!editingQuoteId} onOpenChange={() => setEditingQuoteId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Quote</DialogTitle>
                        <DialogDescription>
                            Set pricing and update status for this quote request.
                        </DialogDescription>
                    </DialogHeader>
                    {editingQuote && (
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
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Quoted Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.quotedPrice}
                                    onChange={(e) => setEditForm({ ...editForm, quotedPrice: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Agent Notes</Label>
                                <Textarea
                                    placeholder="Add internal notes about pricing, availability, etc..."
                                    value={editForm.agentNotes}
                                    onChange={(e) => setEditForm({ ...editForm, agentNotes: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingQuoteId(null)}>Cancel</Button>
                        <Button onClick={handleUpdateQuote} disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

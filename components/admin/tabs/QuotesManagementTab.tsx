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
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal, Calendar, DollarSign, User, Plane, FileText } from "lucide-react";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
            await updateQuote(editingQuoteId, {
                ...editForm,
                quotedPrice: parseFloat(editForm.quotedPrice) || 0,
                serviceFee: parseFloat(editForm.serviceFee) || 0,
            });
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
            quotedPrice: quote.quoted_price || 0,
            serviceFee: quote.service_fee || 0,
            agentNotes: quote.agent_notes || "",
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

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)
                ) : quotes?.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">No quotes found.</div>
                ) : (
                    quotes?.map((quote: AdminQuote) => (
                        <Card key={quote.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <StatusBadge status={quote.status} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openViewModal(quote)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEditModal(quote)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Quote
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-base">{quote.quote_reference}</CardTitle>
                                <CardDescription className="flex items-center mt-1 text-xs">
                                    <User className="w-3 h-3 mr-1" /> {quote.user?.fullName || "Unregistered"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 text-sm space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center"><Plane className="w-3 h-3 mr-1" /> Route:</span>
                                    <span className="font-medium">{quote.origin} → {quote.destination}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center"><Calendar className="w-3 h-3 mr-1" /> Type:</span>
                                    <span className="capitalize">{quote.trip_type}</span>
                                </div>
                                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                                    <span className="text-muted-foreground flex items-center"><DollarSign className="w-3 h-3 mr-1" /> Total:</span>
                                    <span className="font-bold">{quote.total_price ? `$${quote.total_price.toFixed(2)}` : "Pending"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
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
                                            <StatusBadge status={quote.status} />
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
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Quote Details</DialogTitle>
                        <DialogDescription>
                            Reference: {selectedQuote?.quote_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedQuote && (
                        <div className="space-y-6 py-2">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Origin</Label>
                                    <p className="font-medium text-lg">{selectedQuote.origin}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Destination</Label>
                                    <p className="font-medium text-lg">{selectedQuote.destination}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Trip Type</Label>
                                    <p className="font-medium capitalize">{selectedQuote.trip_type}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                    <div className="mt-1"><StatusBadge status={selectedQuote.status} /></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Dates</Label>
                                    <p className="font-medium">{selectedQuote.flexible_dates}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Passengers</Label>
                                    <p className="font-medium">{selectedQuote.num_adults || 1} Adults, {selectedQuote.num_children || 0} Children</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Additional Details</Label>
                                <p className="text-sm bg-muted/20 p-3 rounded">{selectedQuote.additional_details || "None provided"}</p>
                            </div>

                            <div className="border-t pt-4 grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold mb-3">Customer Information</h4>
                                    <div className="space-y-2 text-sm">
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
                                <div>
                                    <h4 className="font-semibold mb-3">Pricing Breakdown</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Quoted Price</span>
                                            <span>${(selectedQuote.quoted_price || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Service Fee</span>
                                            <span>${(selectedQuote.service_fee || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Total</span>
                                            <span>${(selectedQuote.total_price || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedQuote.agent_notes && (
                                <div className="border-t pt-4">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block flex items-center"><FileText className="w-3 h-3 mr-1" /> Agent Notes</Label>
                                    <p className="text-sm whitespace-pre-wrap">{selectedQuote.agent_notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Quote Dialog */}
            <Dialog open={!!editingQuoteId} onOpenChange={() => setEditingQuoteId(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Update Quote</DialogTitle>
                        <DialogDescription>
                            Set pricing and update status for this quote request.
                        </DialogDescription>
                    </DialogHeader>
                    {editingQuote && (
                        <Tabs defaultValue="pricing" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="pricing">Pricing & Status</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pricing" className="space-y-4">
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Quoted Price ($)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editForm.quotedPrice}
                                            onChange={(e) => setEditForm({ ...editForm, quotedPrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Service Fee ($)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editForm.serviceFee}
                                            onChange={(e) => setEditForm({ ...editForm, serviceFee: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="bg-muted p-3 rounded text-sm flex justify-between font-medium">
                                    <span>Total Price Preview:</span>
                                    <span>${((parseFloat(editForm.quotedPrice) || 0) + (parseFloat(editForm.serviceFee) || 0)).toFixed(2)}</span>
                                </div>
                            </TabsContent>
                            <TabsContent value="notes" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Agent Notes (Internal)</Label>
                                    <Textarea
                                        placeholder="Add internal notes about pricing, availability, etc..."
                                        value={editForm.agentNotes}
                                        onChange={(e) => setEditForm({ ...editForm, agentNotes: e.target.value })}
                                        rows={6}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
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

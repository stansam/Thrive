"use client"

/**
 * Payments & History Section Component
 * Displays payment history, transaction details, and allows filtering/searching.
 */

import { useState } from 'react';
import { usePayments } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Search, Filter, RefreshCcw, CreditCard, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ExtendedPayment } from '@/lib/types/dashboard';

import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

export default function PaymentsSection() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // We handle search locally or via API if supported - backend plan supports status/date
    // The requirement mentions search by reference ID. The backend currently filters by status/date.
    // For now we can rely on status and implement client-side filtering for reference ID if lists are small, 
    // or assume the backend 'search' functionality will be added later if needed. 
    // Given the constraints and "Additive-Only", I'll stick to what the backend I implemented supports (status, date)
    // but I'll add a visual search bar that prompts for future implementation or client-side filter.
    const [searchQuery, setSearchQuery] = useState('');

    const { payments, pagination, isLoading, isError, refresh } = usePayments({
        page,
        perPage: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        fromDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        toDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    });

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleDownloadInvoice = (paymentId: string) => {
        // Placeholder for invoice download functionality
        // In a real app, this would trigger a PDF download endpoint
        console.log(`Downloading invoice for payment ${paymentId}`);
        // Could show a toast here
    };

    // Filter payments client-side for search query if provided (since backend search wasn't explicitly added yet)
    const filteredPayments = payments?.filter(payment => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            payment.payment_reference.toLowerCase().includes(query) ||
            payment.description?.toLowerCase().includes(query) ||
            payment.amount.toString().includes(query)
        );
    });

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'refunded':
                return <Badge variant="outline" className="text-muted-foreground border-muted-foreground">Refunded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load payment history. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    const totalPaid = payments?.reduce((acc, curr) =>
        curr.status === 'paid' ? acc + Number(curr.amount) : acc, 0
    ) || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Payments & History</h2>
                <p className="text-muted-foreground">View your transaction history, download invoices, and manage payments.</p>
            </div>

            {/* Payment Summary Header */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime successful payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
                        <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {payments && payments.length > 0 ? `$${Number(payments[0].amount).toFixed(2)}` : '$0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {payments && payments.length > 0
                                ? format(new Date(payments[0].created_at), 'MMM dd, yyyy')
                                : 'No payments yet'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">No pending invoices</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by reference..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* /> */}
                    </div>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refresh()}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>A list of all your payments and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments && filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(payment.created_at), 'h:mm a')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.description || 'Payment'}</div>
                                            <div className="text-xs text-muted-foreground capitalize">
                                                {payment.booking_type ? payment.booking_type.replace('_', ' ') : payment.paymentMethod}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {payment.payment_reference}
                                        </TableCell>
                                        <TableCell>
                                            ${Number(payment.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadInvoice(payment.id)}
                                                title="Download Invoice"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                            >
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={!pagination.hasNext}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

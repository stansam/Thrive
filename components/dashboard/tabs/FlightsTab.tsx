
"use client"

import { useState } from 'react';
import { useFlights } from '@/lib/hooks/use-flights-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Calendar, Search, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';


export default function FlightsTab() {
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });

    const { flights, summary, isLoading, isError } = useFlights(filters);

    if (isError) {
        return <div className="text-red-500">Error loading flights.</div>;
    }

    const summaryCards = [
        { label: 'Upcoming Flights', value: summary?.upcoming || 0, icon: Plane, color: 'text-blue-500' },
        { label: 'Pending Quotes', value: summary?.pending_quote || 0, icon: Clock, color: 'text-yellow-500' },
        { label: 'Ticketed', value: summary?.ticketed || 0, icon: CheckCircle2, color: 'text-green-500' },
        { label: 'Cancelled', value: summary?.cancelled || 0, icon: XCircle, color: 'text-red-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Quick Actions & Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Flights</h2>
                    <p className="text-muted-foreground">Manage your flight bookings and quotes.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/flights/results">
                            Book Flight
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="https://wa.me/1234567890" target="_blank">
                            Contact Concierge
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.label}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : card.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by PNR or Passenger Name"
                                    className="pl-8"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="confirmed">Ticketed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Flight List */}
            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
                ) : flights.length > 0 ? (
                    flights.map((flight: any) => (
                        <Card key={flight.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                                <Plane className="h-5 w-5 text-neutral-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{flight.origin} → {flight.destination}</h3>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <span>{flight.airline}</span>
                                                    <span>•</span>
                                                    <span>{flight.flight_number}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={`capitalize ${flight.status === 'confirmed' ? 'bg-green-500' :
                                            flight.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}>
                                            {flight.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Departure</p>
                                            <p className="font-medium">
                                                {new Date(flight.departure_date).toLocaleDateString()}
                                                <br />
                                                {new Date(flight.departure_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Arrival</p>
                                            <p className="font-medium">
                                                {new Date(flight.return_date).toLocaleDateString()}
                                                <br />
                                                {new Date(flight.return_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Reference</p>
                                            <p className="font-medium text-mono">{flight.booking_reference}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Price</p>
                                            <p className="font-medium">$ {flight.total_price}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 flex flex-row md:flex-col justify-center items-center gap-2 border-t md:border-t-0 md:border-l">
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/dashboard/flights/${flight.booking_reference}`}>
                                            Manage
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plane className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No flights found</h3>
                        <p className="text-muted-foreground">Book your first flight to see it here.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/flights/results">Book a Flight</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

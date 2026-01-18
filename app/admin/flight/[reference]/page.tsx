"use client";

import { use, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { AdminBookingHeader } from "@/components/admin/flights/AdminBookingHeader";
import { AdminBookingTimeline } from "@/components/admin/flights/AdminBookingTimeline";
import { PassengerInfoCard } from "@/components/admin/flights/PassengerInfoCard";
import { FareBreakdownCard } from "@/components/admin/flights/FareBreakdownCard";
import { InvoicePanel } from "@/components/admin/flights/InvoicePanel";
import { TicketUploader } from "@/components/admin/flights/TicketUploader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAdminFlight } from "@/lib/hooks/use-admin-flight";
import { Badge } from "@/components/ui/badge";

export default function AdminFlightPage({ params }: { params: Promise<{ reference: string }> }) {
    const { reference } = use(params);
    const { user } = useAuth();

    // Fetch data using custom hook
    const { booking, error, isLoading, refresh } = useAdminFlight(reference || null);

    if (error) {
        return (
            <AdminDashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Booking</h2>
                    <p className="text-muted-foreground mb-4">Could not retrieve flight details. Please try again.</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </AdminDashboardLayout>
        );
    }

    if (isLoading || !booking) {
        return (
            <AdminDashboardLayout>
                <div className="container mx-auto p-6 space-y-6">
                    <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
                    <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 h-64 bg-muted animate-pulse rounded-lg" />
                        <div className="col-span-1 h-64 bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
            </AdminDashboardLayout>
        );
    }

    return (
        <AdminDashboardLayout>
            <div className="container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                        <Link href="/admin?tab=flights">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Flight Management
                        </Link>
                    </Button>
                </div>

                {/* 1. Command Header */}
                <AdminBookingHeader booking={booking} onRefresh={refresh} />

                {/* 2. Timeline */}
                <AdminBookingTimeline status={booking.status} />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 3. Flight & Passengers */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Flight Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Airline</span>
                                        <span className="font-medium">{booking.flight.airline}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Route</span>
                                        <span className="font-medium">{booking.flight.origin} → {booking.flight.destination}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Depart</span>
                                        <span className="font-medium">{booking.flight.departure_date ? new Date(booking.flight.departure_date).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Class</span>
                                        <Badge variant="outline">{booking.flight.cabin_class}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <PassengerInfoCard passengers={booking.passengers} />
                        </div>

                        {/* 4. Invoice Management */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Invoices & Payments</h3>
                            <InvoicePanel invoices={booking.invoices} />
                        </div>

                        {/* 5. Ticket Management */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Ticketing</h3>
                            <TicketUploader documents={booking.documents} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN (1/3) */}
                    <div className="space-y-8">
                        {/* 6. Commercials */}
                        <FareBreakdownCard pricing={booking.pricing} />

                        {/* 7. Activity Log */}
                        <Card className="bg-muted/10 h-[500px] overflow-hidden flex flex-col">
                            <CardHeader className="border-b bg-background">
                                <CardTitle className="text-base">Audit Log</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                <div className="divide-y">
                                    {booking.activity_log && booking.activity_log.length > 0 ? (
                                        booking.activity_log.map((log: any) => (
                                            <div key={log.id} className="p-4 text-sm hover:bg-muted/50 transition-colors">
                                                <p className="font-medium">{log.message}</p>
                                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                                    <span>{log.created_by}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            No activity recorded.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminDashboardLayout>
    );
}

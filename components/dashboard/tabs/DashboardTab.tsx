"use client"

/**
 * Main Dashboard Tab Component
 * Displays statistics, revenue chart, and recent bookings
 */

import { useDashboardSummary } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, CreditCard, Activity, TrendingUp, Plane, AlertCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { DashboardStats, RecentBooking } from '@/lib/types/dashboard';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend !== undefined && (
                    <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(trend)}% from last month
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function RecentBookingItem({ booking }: { booking: RecentBooking }) {
    const statusColors: Record<string, string> = {
        confirmed: 'bg-green-500',
        pending: 'bg-yellow-500',
        cancelled: 'bg-red-500',
        completed: 'bg-blue-500',
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="font-medium">{booking.bookingReference}</p>
                    <p className="text-sm text-muted-foreground">
                        {booking.destination} • {booking.departureDate ? format(new Date(booking.departureDate), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-medium">${booking.totalPrice?.toFixed(2) || '0.00'}</p>
                    <Badge variant="outline" className="mt-1">
                        <div className={`h-2 w-2 rounded-full ${statusColors[booking.status] || 'bg-gray-500'} mr-1`} />
                        {booking.status}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export default function DashboardTab() {
    const { summary, isLoading, isError, error } = useDashboardSummary();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-80 w-full" />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load dashboard data. {error?.message || 'Please try again later.'}
                </AlertDescription>
            </Alert>
        );
    }


    const stats: DashboardStats = summary?.stats || {
        totalBookings: 0,
        confirmedBookings: 0,
        totalSpent: 0,
        upcomingBookings: 0,
        activeTrips: 0,
        unreadNotifications: 0
    };
    const chartData = summary?.chartData || [];
    const recentBookings = summary?.recentBookings || [];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings || 0}
                    description="All time bookings"
                    icon={Activity}
                />
                <StatCard
                    title="Confirmed Bookings"
                    value={stats.confirmedBookings || 0}
                    description="Active bookings"
                    icon={CreditCard}
                />
                <StatCard
                    title="Total Spent"
                    value={`$${(stats.totalSpent || 0).toFixed(2)}`}
                    description="Lifetime spending"
                    icon={DollarSign}
                />
                <StatCard
                    title="Upcoming Trips"
                    value={stats.upcomingBookings || 0}
                    description="In the next 30 days"
                    icon={Plane}
                />
            </div>

            {/* Chart and Recent Bookings */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Monthly Spending</CardTitle>
                        <CardDescription>Your travel expenses over the last 12 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="name"
                                        className="text-xs"
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    Month
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].payload.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    Spent
                                                                </span>
                                                                <span className="font-bold">
                                                                    ${payload[0].value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-80 items-center justify-center text-muted-foreground">
                                No spending data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Your latest travel bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentBookings.length > 0 ? (
                                recentBookings.slice(0, 5).map((booking: RecentBooking) => (
                                    <RecentBookingItem key={booking.id} booking={booking} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Plane className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-muted-foreground">No bookings yet</p>
                                    <Button variant="link" className="mt-2">
                                        Book your first trip
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subscription Status */}
            {summary?.hasActiveSubscription && (
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Current Plan: <span className="capitalize">{summary.subscriptionTier}</span>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enjoying premium benefits
                                </p>
                            </div>
                            <Badge variant="default" className="capitalize">
                                {summary.subscriptionTier}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

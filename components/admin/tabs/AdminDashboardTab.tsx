"use client";

import { Card } from "@/components/ui/card";
import { useAdminDashboard } from "@/lib/hooks/use-admin-api";
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function AdminDashboardTab() {
    const { dashboard, isLoading, isError } = useAdminDashboard();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isError || !dashboard) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load dashboard data</p>
            </div>
        );
    }

    const { stats, revenueChart } = dashboard;

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            subtitle: `+${stats.newUsersThisMonth} this month`,
            icon: <Users className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600",
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            subtitle: `${stats.confirmedBookings} confirmed`,
            icon: <Calendar className="w-6 h-6" />,
            color: "from-green-500 to-green-600",
        },
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            subtitle: `$${stats.monthRevenue.toLocaleString()} this month`,
            icon: <DollarSign className="w-6 h-6" />,
            color: "from-purple-500 to-purple-600",
        },
        {
            title: "Pending Quotes",
            value: stats.pendingQuotes,
            subtitle: `${stats.totalQuotes} total quotes`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: "from-orange-500 to-orange-600",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                                >
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {stat.value}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                            <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Revenue Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Revenue Trend (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.usersByRole || {}).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">{role}</span>
                                <span className="font-semibold">{count as number}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confirmed</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="font-semibold">{stats.confirmedBookings}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending</span>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold">{stats.pendingBookings}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Platform Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Active Packages</span>
                            <span className="font-semibold">{stats.activePackages}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Unread Messages</span>
                            <span className="font-semibold text-orange-600">
                                {stats.unreadContacts}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

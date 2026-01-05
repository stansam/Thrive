"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsers, useUser, useUpdateUser } from "@/lib/hooks/use-admin-api";
import { Search, Edit, Ban, Eye, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminUser } from "@/lib/types/admin.d.ts";
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

export default function UsersManagementTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const { users, pagination, isLoading, refresh } = useUsers({
        page,
        search,
        role: roleFilter === "all" ? "" : roleFilter,
    });

    const { user: selectedUser, isLoading: loadingUser } = useUser(selectedUserId);
    const { user: editingUser, isLoading: loadingEditUser } = useUser(editingUserId);
    const { updateUser, isLoading: updating } = useUpdateUser();

    const handleEditUser = async () => {
        if (!editingUserId) return;

        try {
            await updateUser(editingUserId, editForm);
            setEditingUserId(null);
            setEditForm({});
            refresh();
            alert("User updated successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to update user");
        }
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUserId(user.id);
        setEditForm({
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone || "",
            role: user.role,
            subscriptionTier: user.subscription_tier,
            isActive: user.is_active,
            emailVerified: user.email_verified,
        });
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="corporate">Corporate</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Subscription
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Joined
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
                                        <td colSpan={6} className="px-6 py-4">
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users?.map((user: AdminUser) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-indigo-600 font-semibold">
                                                        {user.first_name[0]}{user.last_name[0]}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize text-sm text-gray-600">
                                                {user.subscription_tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-800">
                                                    <UserX className="w-3 h-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedUserId(user.id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(user)}
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
                            Showing <span className="font-medium">{(page - 1) * pagination.perPage + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(page * pagination.perPage, pagination.totalItems)}
                            </span>{" "}
                            of <span className="font-medium">{pagination.totalItems}</span> users
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

            {/* User Details Modal */}
            <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {selectedUser?.first_name} {selectedUser?.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    {loadingUser ? (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : selectedUser ? (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Name</Label>
                                    <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Email</Label>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Phone</Label>
                                    <p className="font-medium">{selectedUser.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Role</Label>
                                    <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Subscription</Label>
                                    <p className="font-medium capitalize">{selectedUser.subscription_tier}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Status</Label>
                                    <Badge className={selectedUser.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {selectedUser.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Bookings</p>
                                        <p className="text-2xl font-bold">{selectedUser.totalBookings || 0}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Spent</p>
                                        <p className="text-2xl font-bold">${selectedUser.totalSpent?.toFixed(2) || "0.00"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            {selectedUser.recentBookings && selectedUser.recentBookings.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Recent Bookings</h3>
                                    <div className="space-y-2">
                                        {selectedUser.recentBookings.slice(0, 3).map((booking: any) => (
                                            <div key={booking.id} className="flex items-center justify-between p-2 border rounded">
                                                <span className="text-sm font-medium">{booking.booking_reference}</span>
                                                <Badge className="capitalize">{booking.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={!!editingUserId} onOpenChange={() => setEditingUserId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information and permissions
                        </DialogDescription>
                    </DialogHeader>
                    {loadingEditUser ? (
                        <Skeleton className="h-64 w-full" />
                    ) : editingUser ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>First Name</Label>
                                    <Input
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Last Name</Label>
                                    <Input
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Role</Label>
                                <Select
                                    value={editForm.role}
                                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">Customer</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Subscription Tier</Label>
                                <Select
                                    value={editForm.subscriptionTier}
                                    onValueChange={(value) => setEditForm({ ...editForm, subscriptionTier: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="bronze">Bronze</SelectItem>
                                        <SelectItem value="silver">Silver</SelectItem>
                                        <SelectItem value="gold">Gold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editForm.emailVerified}
                                        onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">Email Verified</span>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingUserId(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleEditUser}
                                    disabled={updating}
                                    className="flex-1"
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}

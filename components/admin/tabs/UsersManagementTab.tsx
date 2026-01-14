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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsers, useUser, useUpdateUser } from "@/lib/hooks/use-admin-api";
import { Search, Eye, Edit, UserCheck, UserX, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { AdminUser } from "@/lib/types/admin.d.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UsersManagementTab() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [subscriptionFilter, setSubscriptionFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editForm, setEditForm] = useState<any>({});

    const { toast } = useToast();

    const { users, pagination, isLoading, refresh } = useUsers({
        page,
        search: searchQuery,
        role: roleFilter === "all" ? "" : roleFilter,
        subscriptionTier: subscriptionFilter === "all" ? "" : subscriptionFilter,
        isActive: statusFilter === "all" ? "" : statusFilter,
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
            toast({
                title: "User updated",
                description: "The user details have been successfully updated.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update user. Please try again.",
            });
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
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px]">
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
                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Users Table Card */}
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        Manage user accounts, roles, and subscriptions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Subscription</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-10 w-10 rounded-full inline-block mr-2" /><Skeleton className="h-4 w-32 inline-block" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users?.map((user: AdminUser) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name} ${user.last_name}`} alt={`${user.first_name} ${user.last_name}`} />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize text-sm">
                                                {user.subscription_tier}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_active ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none shadow-none">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
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
                                                    <DropdownMenuItem onClick={() => setSelectedUserId(user.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        {user.is_active ? (
                                                            <>
                                                                <UserX className="mr-2 h-4 w-4" /> Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="mr-2 h-4 w-4" /> Activate
                                                            </>
                                                        )}
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
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing <strong>{(page - 1) * pagination.perPage + 1}</strong>-<strong>{Math.min(page * pagination.perPage, pagination.totalItems)}</strong> of <strong>{pagination.totalItems}</strong>
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
                )}
            </Card>

            {/* View User Dialog */}
            <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Full profile information for {selectedUser?.first_name} {selectedUser?.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    {loadingUser ? (
                        <div className="space-y-4 py-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : selectedUser ? (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Full Name</Label>
                                    <div className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Email</Label>
                                    <div className="font-medium">{selectedUser.email}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <div className="font-medium">{selectedUser.phone || "N/A"}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Role</Label>
                                    <div><Badge variant="outline">{selectedUser.role}</Badge></div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Subscription</Label>
                                    <div className="capitalize font-medium">{selectedUser.subscription_tier}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div>
                                        {selectedUser.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 border-none">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-4">Activity Stats</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                                        <div className="text-2xl font-bold">{selectedUser.totalBookings || 0}</div>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Total Spent</div>
                                        <div className="text-2xl font-bold">${selectedUser.totalSpent?.toFixed(2) || "0.00"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUserId} onOpenChange={() => setEditingUserId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Profile</DialogTitle>
                        <DialogDescription>
                            Make changes to the user's profile and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    {loadingEditUser ? (
                        <div className="space-y-4 py-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : editingUser ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={editForm.role}
                                        onValueChange={(val) => setEditForm({ ...editForm, role: val })}
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
                                <div className="space-y-2">
                                    <Label htmlFor="subscription">Subscription</Label>
                                    <Select
                                        value={editForm.subscriptionTier}
                                        onValueChange={(val) => setEditForm({ ...editForm, subscriptionTier: val })}
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
                            </div>
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    />
                                    <Label htmlFor="isActive">Active Account</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="emailVerified"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={editForm.emailVerified}
                                        onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                                    />
                                    <Label htmlFor="emailVerified">Email Verified</Label>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUserId(null)}>Cancel</Button>
                        <Button onClick={handleEditUser} disabled={updating}>
                            {updating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

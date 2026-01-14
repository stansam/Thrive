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
import { usePackages, useCreatePackage, useUpdatePackage } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { AdminPackage } from "@/lib/types/admin.d.ts";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PackagesManagementTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();

    const { packages, pagination, isLoading, refresh } = usePackages({ page, search });

    const [selectedPackage, setSelectedPackage] = useState<AdminPackage | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null);

    const { createPackage, isLoading: isCreatingPackage } = useCreatePackage();
    const { updatePackage, isLoading: isUpdatingPackage } = useUpdatePackage();

    const handleSavePackage = async () => {
        try {
            if (isCreating) {
                await createPackage(formData);
                toast({
                    title: "Package Created",
                    description: "New travel package has been successfully created.",
                });
            } else if (editingPackageId) {
                await updatePackage(editingPackageId, formData);
                toast({
                    title: "Package Updated",
                    description: "Travel package details have been updated.",
                });
            }
            setIsCreating(false);
            setEditingPackageId(null);
            setFormData({});
            refresh();
        } catch (error: any) {
            console.error("Failed to save package", error);
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: `Failed to ${isCreating ? 'create' : 'update'} package. Please try again.`,
            });
        }
    };

    const openViewModal = (pkg: AdminPackage) => {
        setSelectedPackageId(pkg.id);
        setSelectedPackage(pkg);
    };

    const openEditModal = (pkg: AdminPackage) => {
        setEditingPackageId(pkg.id);
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            destinationCity: pkg.destination.split(",")[0],
            destinationCountry: pkg.destination.split(",")[1]?.trim() || "",
            duration: pkg.duration,
            startingPrice: pkg.starting_price,
            is_active: pkg.is_active,
        });
    };

    const openCreateModal = () => {
        setIsCreating(true);
        setFormData({
            name: "",
            destinationCity: "",
            destinationCountry: "",
            durationDays: 3,
            durationNights: 2,
            startingPrice: 0,
            pricePerPerson: 0,
            description: "",
        });
    };

    return (
        <div className="space-y-4">
            {/* Header & Actions */}
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Search packages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Package
                </Button>
            </div>

            {/* Packages Table Card */}
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Travel Packages</CardTitle>
                    <CardDescription>
                        Manage travel packages and their availability.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">Package Name</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : packages?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No packages found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages?.map((pkg: AdminPackage) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">
                                            {pkg.name}
                                        </TableCell>
                                        <TableCell>
                                            {pkg.destination}
                                        </TableCell>
                                        <TableCell>
                                            {pkg.duration}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${pkg.starting_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={pkg.is_active ? "default" : "secondary"}>
                                                {pkg.is_active ? "Active" : "Inactive"}
                                            </Badge>
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
                                                    <DropdownMenuItem onClick={() => openViewModal(pkg)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(pkg)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Package
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
                )}
            </Card>

            {/* View Package Dialog */}
            <Dialog open={!!selectedPackageId} onOpenChange={() => setSelectedPackageId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Package Details</DialogTitle>
                        <DialogDescription>{selectedPackage?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedPackage && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Destination</Label>
                                    <p className="font-medium">{selectedPackage.destination}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Duration</Label>
                                    <p className="font-medium">{selectedPackage.duration}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Starting Price</Label>
                                    <p className="font-medium text-lg">${selectedPackage.starting_price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge variant={selectedPackage.is_active ? "default" : "secondary"}>
                                            {selectedPackage.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="text-sm mt-1">{selectedPackage.description || "No description provided."}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Package Dialog */}
            <Dialog open={isCreating} onOpenChange={() => setIsCreating(false)}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Package</DialogTitle>
                        <DialogDescription>Add a new travel package to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Package Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Paris Adventure"
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Destination City *</Label>
                                <Input
                                    value={formData.destinationCity}
                                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                                    placeholder="Paris"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Country *</Label>
                                <Input
                                    value={formData.destinationCountry}
                                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                                    placeholder="France"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Duration (Days) *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Nights *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.durationNights}
                                    onChange={(e) => setFormData({ ...formData, durationNights: parseInt(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Starting Price ($) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.startingPrice}
                                    onChange={(e) => setFormData({ ...formData, startingPrice: parseFloat(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Price Per Person ($) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.pricePerPerson}
                                    onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief package description..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)} disabled={isCreatingPackage}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePackage} disabled={isCreatingPackage}>
                            {isCreatingPackage ? "Creating..." : "Create Package"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Package Dialog */}
            <Dialog open={!!editingPackageId} onOpenChange={() => setEditingPackageId(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                        <DialogDescription>Update package information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Package Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Starting Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.startingPrice}
                                    onChange={(e) => setFormData({ ...formData, startingPrice: parseFloat(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Duration String</Label>
                                <Input
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g., 5 days, 4 nights"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPackageId(null)} disabled={isUpdatingPackage}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePackage} disabled={isUpdatingPackage}>
                            {isUpdatingPackage ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

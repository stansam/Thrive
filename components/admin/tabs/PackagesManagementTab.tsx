"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePackages, useCreatePackage, useUpdatePackage } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Plus, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminPackage } from "@/lib/types/admin.d.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PackagesManagementTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const { packages, pagination, isLoading, refresh } = usePackages({ page, search });

    const [selectedPackage, setSelectedPackage] = useState<AdminPackage | null>(null);
    const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null);

    const { createPackage, isLoading: isCreatingPackage } = useCreatePackage();
    const { updatePackage, isLoading: isUpdatingPackage } = useUpdatePackage();

    const handleCreatePackage = async () => {
        try {
            await createPackage(formData);
            setIsCreating(false);
            setFormData({});
            refresh();
            alert("Package created successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to create package");
        }
    };

    const handleUpdatePackage = async () => {
        if (!editingPackageId) return;

        try {
            await updatePackage(editingPackageId, formData);
            setEditingPackageId(null);
            setFormData({});
            refresh();
            alert("Package updated successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to update package");
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
        <div className="space-y-6">
            {/* Header & Actions */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
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
            </Card>

            {/* Packages Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Package Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Destination
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
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
                            ) : packages?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No packages found
                                    </td>
                                </tr>
                            ) : (
                                packages?.map((pkg: AdminPackage) => (
                                    <tr key={pkg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {pkg.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {pkg.destination}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {pkg.duration}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${pkg.starting_price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {pkg.is_active ? (
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openViewModal(pkg)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(pkg)}
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
                            Page {page} of {pagination.totalPages}
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

            {/* View Package Modal */}
            <Dialog open={!!selectedPackageId} onOpenChange={() => setSelectedPackageId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Package Details</DialogTitle>
                        <DialogDescription>{selectedPackage?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedPackage && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Destination</Label>
                                    <p className="font-medium">{selectedPackage.destination}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Duration</Label>
                                    <p className="font-medium">{selectedPackage.duration}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Starting Price</Label>
                                    <p className="font-medium text-lg">${selectedPackage.starting_price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Status</Label>
                                    <Badge className={selectedPackage.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                        {selectedPackage.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Package Modal */}
            <Dialog open={isCreating} onOpenChange={() => setIsCreating(false)}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Package</DialogTitle>
                        <DialogDescription>Add a new travel package to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Package Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Paris Adventure"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Destination City *</Label>
                                <Input
                                    value={formData.destinationCity}
                                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                                    placeholder="Paris"
                                />
                            </div>
                            <div>
                                <Label>Country *</Label>
                                <Input
                                    value={formData.destinationCountry}
                                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                                    placeholder="France"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Duration (Days) *</Label>
                                <Input
                                    type="number"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Nights *</Label>
                                <Input
                                    type="number"
                                    value={formData.durationNights}
                                    onChange={(e) => setFormData({ ...formData, durationNights: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Starting Price ($) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.startingPrice}
                                    onChange={(e) => setFormData({ ...formData, startingPrice: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Price Per Person ($) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.pricePerPerson}
                                    onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
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
                            />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreating(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreatePackage}
                                className="flex-1"
                            >
                                Create Package
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Package Modal */}
            <Dialog open={!!editingPackageId} onOpenChange={() => setEditingPackageId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                        <DialogDescription>Update package information</DialogDescription>
                    </DialogHeader>
                    {editingPackage && (
                        <div className="space-y-4">
                            <div>
                                <Label>Package Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    />
                                </div>
                                <div>
                                    <Label>Duration</Label>
                                    <Input
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="e.g., 5 days, 4 nights"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingPackageId(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdatePackage}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

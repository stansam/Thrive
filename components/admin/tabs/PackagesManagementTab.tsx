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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePackages, useCreatePackage, useUpdatePackage } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Plus, ChevronLeft, ChevronRight, MoreHorizontal, MapPin, Calendar, DollarSign, Hotel } from "lucide-react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Helper to convert array to newline-separated string
const arrayToText = (arr?: string[]) => (arr ? arr.join("\n") : "");
// Helper to convert newline-separated string to array
const textToArray = (text: string) => text.split("\n").filter((line) => line.trim() !== "");

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

    const { createPackage, isLoading: isCreatingPackage } = useCreatePackage();
    const { updatePackage, isLoading: isUpdatingPackage } = useUpdatePackage();

    const handleSavePackage = async () => {
        try {
            // Prepare payload
            const payload = {
                ...formData,
                duration_days: parseInt(formData.duration_days) || 0,
                duration_nights: parseInt(formData.duration_nights) || 0,
                starting_price: parseFloat(formData.starting_price) || 0,
                price_per_person: parseFloat(formData.price_per_person) || 0,
                hotel_rating: parseInt(formData.hotel_rating) || 3,
                highlights: textToArray(formData.highlightsStr || ""),
                inclusions: textToArray(formData.inclusionsStr || ""),
                exclusions: textToArray(formData.exclusionsStr || ""),
            };

            // Cleanup temp fields
            delete payload.highlightsStr;
            delete payload.inclusionsStr;
            delete payload.exclusionsStr;

            if (isCreating) {
                await createPackage(payload);
                toast({
                    title: "Package Created",
                    description: "New travel package has been successfully created.",
                });
            } else if (editingPackageId) {
                await updatePackage(editingPackageId, payload);
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
                description: `Failed to ${isCreating ? "create" : "update"} package. Please try again.`,
            });
        }
    };

    const openViewModal = (pkg: AdminPackage) => {
        setSelectedPackageId(pkg.id);
        setSelectedPackage(pkg);
    };

    const openEditModal = (pkg: AdminPackage) => {
        setEditingPackageId(pkg.id);
        setFormData({
            ...pkg,
            highlightsStr: arrayToText(pkg.highlights),
            inclusionsStr: arrayToText(pkg.inclusions),
            exclusionsStr: arrayToText(pkg.exclusions),
        });
    };

    const openCreateModal = () => {
        setIsCreating(true);
        setFormData({
            name: "",
            destination_city: "",
            destination_country: "",
            duration_days: 3,
            duration_nights: 2,
            starting_price: 0,
            price_per_person: 0,
            description: "", // full_description
            short_description: "",
            hotel_name: "",
            hotel_rating: 3,
            is_active: true,
            is_featured: false,
            highlightsStr: "",
            inclusionsStr: "",
            exclusionsStr: "",
        });
    };

    // Shared Form Content for Create/Edit
    const PackageFormContent = () => (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="meta">Meta & Hotel</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="pkg-name">Package Name</Label>
                    <Input
                        id="pkg-name"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Magic of Paris"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>City</Label>
                        <Input
                            value={formData.destination_city || ""}
                            onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                            placeholder="Paris"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Country</Label>
                        <Input
                            value={formData.destination_country || ""}
                            onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                            placeholder="France"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Days</Label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.duration_days || ""}
                            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Nights</Label>
                        <Input
                            type="number"
                            min="0"
                            value={formData.duration_nights || ""}
                            onChange={(e) => setFormData({ ...formData, duration_nights: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Short Description</Label>
                    <Textarea
                        value={formData.short_description || ""}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        rows={2}
                    />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Switch
                        id="is-active"
                        checked={formData.is_active}
                        onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
                    />
                    <Label htmlFor="is-active">Active (Visible to users)</Label>
                </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Starting Price ($)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.starting_price || ""}
                            onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Price Per Person ($)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.price_per_person || ""}
                            onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                    <Switch
                        id="is-featured"
                        checked={formData.is_featured}
                        onCheckedChange={(val) => setFormData({ ...formData, is_featured: val })}
                    />
                    <Label htmlFor="is-featured">Featured Package (Promoted on homepage)</Label>
                </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid gap-2">
                    <Label>Full Description</Label>
                    <Textarea
                        value={formData.full_description || (isCreating ? formData.description : "") || ""}
                        onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                        rows={4}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Highlights (one per line)</Label>
                    <Textarea
                        value={formData.highlightsStr || ""}
                        onChange={(e) => setFormData({ ...formData, highlightsStr: e.target.value })}
                        placeholder="e.g. Eiffel Tower Visit\nSeine River Cruise"
                        rows={4}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Inclusions (one per line)</Label>
                        <Textarea
                            value={formData.inclusionsStr || ""}
                            onChange={(e) => setFormData({ ...formData, inclusionsStr: e.target.value })}
                            rows={4}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Exclusions (one per line)</Label>
                        <Textarea
                            value={formData.exclusionsStr || ""}
                            onChange={(e) => setFormData({ ...formData, exclusionsStr: e.target.value })}
                            rows={4}
                        />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="meta" className="space-y-4 py-4">
                <div className="grid gap-2">
                    <Label>Hotel Name</Label>
                    <Input
                        value={formData.hotel_name || ""}
                        onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Hotel Rating (1-5)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.hotel_rating || ""}
                            onChange={(e) => setFormData({ ...formData, hotel_rating: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Room Type</Label>
                        <Input
                            value={formData.room_type || ""}
                            onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Meta Title (SEO)</Label>
                    <Input
                        value={formData.meta_title || ""}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Meta Description (SEO)</Label>
                    <Textarea
                        value={formData.meta_description || ""}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        rows={2}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Featured Image URL</Label>
                    <Input
                        value={formData.featured_image || ""}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    />
                </div>
            </TabsContent>
        </Tabs>
    );

    // Hooks for toast
    // already imported

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

            {/* Mobile Card View (Visible only on small screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)
                ) : packages?.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">No packages found.</div>
                ) : (
                    packages?.map((pkg: AdminPackage) => (
                        <Card key={pkg.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant={pkg.is_active ? "default" : "secondary"}>{pkg.is_active ? "Active" : "Inactive"}</Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openViewModal(pkg)}>View Details</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEditModal(pkg)}>Edit Package</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <MapPin className="w-3 h-3 mr-1" /> {pkg.destination_city}, {pkg.destination_country}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center"><Calendar className="w-3 h-3 mr-1" /> Duration:</span>
                                    <span>{pkg.duration_days}D / {pkg.duration_nights}N</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center"><DollarSign className="w-3 h-3 mr-1" /> Starting:</span>
                                    <span className="font-semibold">${pkg.starting_price.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View (Hidden on small screens) */}
            <Card className="hidden md:block">
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
                                            {pkg.is_featured && <Badge variant="outline" className="ml-2 text-xs">Featured</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            {pkg.destination_city}, {pkg.destination_country}
                                        </TableCell>
                                        <TableCell>
                                            {pkg.duration_days} Days, {pkg.duration_nights} Nights
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
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Package Details</DialogTitle>
                        <DialogDescription>{selectedPackage?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedPackage && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Destination</Label>
                                    <p className="font-medium">{selectedPackage.destination_city}, {selectedPackage.destination_country}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Duration</Label>
                                    <p className="font-medium">{selectedPackage.duration_days}D / {selectedPackage.duration_nights}N</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Starting Price</Label>
                                    <p className="font-medium text-lg text-primary">${selectedPackage.starting_price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={selectedPackage.is_active ? "default" : "secondary"}>
                                            {selectedPackage.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Description</Label>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedPackage.full_description || selectedPackage.description || "No description provided."}
                                </p>
                            </div>

                            {selectedPackage.hotel_name && (
                                <div className="space-y-2">
                                    <Label className="font-semibold flex items-center"><Hotel className="w-4 h-4 mr-2" /> Accommodation</Label>
                                    <div className="bg-card border p-3 rounded text-sm">
                                        <span className="font-medium">{selectedPackage.hotel_name}</span>
                                        {selectedPackage.hotel_rating && <Badge variant="outline" className="ml-2">{selectedPackage.hotel_rating} Stars</Badge>}
                                        {selectedPackage.room_type && <span className="text-muted-foreground ml-2">• {selectedPackage.room_type}</span>}
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {selectedPackage.highlights && selectedPackage.highlights.length > 0 && (
                                    <div>
                                        <Label className="font-semibold block mb-2">Highlights</Label>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {selectedPackage.highlights.map((h, i) => (
                                                <li key={i}>{h}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                                    <div>
                                        <Label className="font-semibold block mb-2">Inclusions</Label>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {selectedPackage.inclusions.map((inc, i) => (
                                                <li key={i}>{inc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Package Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Package</DialogTitle>
                        <DialogDescription>Add a new travel package to the system</DialogDescription>
                    </DialogHeader>
                    <PackageFormContent />
                    <DialogFooter className="gap-2 sm:gap-0">
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
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                        <DialogDescription>Update package information</DialogDescription>
                    </DialogHeader>
                    <PackageFormContent />
                    <DialogFooter className="gap-2 sm:gap-0">
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

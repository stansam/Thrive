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
import { Textarea } from "@/components/ui/textarea";
import { useContactMessages, useUpdateContactMessage, useDeleteContactMessage } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Trash, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ContactMessage } from "@/lib/types/admin.d.ts";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ContactMessagesTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editForm, setEditForm] = useState<any>({});
    const { toast } = useToast();

    const { contacts, pagination, isLoading, refresh } = useContactMessages({
        page,
        status: statusFilter === "all" ? "" : statusFilter,
        priority: priorityFilter === "all" ? "" : priorityFilter,
    });

    const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
    const [editingContact, setEditingContact] = useState<ContactMessage | null>(null);

    const { updateContact, isLoading: isUpdating } = useUpdateContactMessage();
    const { deleteContact, isLoading: isDeleting } = useDeleteContactMessage();

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: "bg-blue-100 text-blue-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            resolved: "bg-green-100 text-green-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: "bg-gray-100 text-gray-800",
            normal: "bg-blue-100 text-blue-800",
            high: "bg-orange-100 text-orange-800",
            urgent: "bg-red-100 text-red-800",
        };
        return colors[priority] || "bg-gray-100 text-gray-800";
    };

    const handleUpdateContact = async () => {
        if (!editingMessageId) return;

        try {
            await updateContact(editingMessageId, editForm);
            setEditingMessageId(null);
            setEditForm({});
            refresh();
            toast({
                title: "Message Updated",
                description: "The message status/notes have been updated.",
            });
        } catch (error: any) {
            console.error("Failed to update message", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update the message. Please try again.",
            });
        }
    };

    const handleDeleteContact = async () => {
        if (!deletingMessageId) return;

        try {
            await deleteContact(deletingMessageId);
            setDeletingMessageId(null);
            refresh();
            toast({
                title: "Message Deleted",
                description: "The message has been permanently removed.",
            });
        } catch (error: any) {
            console.error("Failed to delete message", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete the message. Please try again.",
            });
        }
    };

    const openViewModal = (contact: ContactMessage) => {
        setSelectedMessageId(contact.id);
        setSelectedContact(contact);
    };

    const openEditModal = (contact: ContactMessage) => {
        setEditingMessageId(contact.id);
        setEditingContact(contact);
        setEditForm({
            status: contact.status,
            priority: contact.priority,
            adminNotes: contact.admin_notes || "",
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-end gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Contact Messages Table Card */}
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>Contact Messages</CardTitle>
                    <CardDescription>
                        Customer inquiries and support requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Name</TableHead>
                                <TableHead className="w-[200px]">Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : contacts?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No contact messages found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts?.map((contact: ContactMessage) => (
                                    <TableRow key={contact.id}>
                                        <TableCell>
                                            <div className="font-medium">{contact.name}</div>
                                            <div className="text-xs text-muted-foreground">{contact.email}</div>
                                        </TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={contact.subject}>
                                            {contact.subject}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`hover:bg-opacity-80 border-none shadow-none capitalize ${getStatusColor(contact.status)}`}>
                                                {contact.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`hover:bg-opacity-80 border-none shadow-none capitalize ${getPriorityColor(contact.priority)}`}>
                                                {contact.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(contact.created_at), "MMM d, yyyy")}
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
                                                    <DropdownMenuItem onClick={() => openViewModal(contact)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(contact)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Update Status
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeletingMessageId(contact.id)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
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

            {/* View Contact Dialog */}
            <Dialog open={!!selectedMessageId} onOpenChange={() => setSelectedMessageId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Contact Message Details</DialogTitle>
                        <DialogDescription>From {selectedContact?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                                    <p className="font-medium">{selectedContact.email}</p>
                                </div>
                                {selectedContact.phone && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone</Label>
                                        <p className="font-medium">{selectedContact.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
                                    <p className="font-medium">
                                        {format(new Date(selectedContact.created_at), "PPP p")}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                    <div>
                                        <Badge className={`mt-1 capitalize ${getStatusColor(selectedContact.status)}`}>
                                            {selectedContact.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Subject</Label>
                                <p className="font-medium text-lg">{selectedContact.subject}</p>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Message</Label>
                                <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                                    {selectedContact.message}
                                </div>
                            </div>

                            {selectedContact.admin_notes && (
                                <div className="border-t pt-4">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Admin Notes</Label>
                                    <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-lg text-sm whitespace-pre-wrap text-yellow-900">
                                        {selectedContact.admin_notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Contact Dialog */}
            <Dialog open={!!editingMessageId} onOpenChange={() => setEditingMessageId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Message Status</DialogTitle>
                        <DialogDescription>
                            Update status, priority, and add admin notes.
                        </DialogDescription>
                    </DialogHeader>
                    {editingContact && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={editForm.priority}
                                    onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Admin Notes</Label>
                                <Textarea
                                    placeholder="Add internal notes about this message..."
                                    value={editForm.adminNotes}
                                    onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMessageId(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateContact}
                            disabled={isUpdating}
                        >
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Contact Dialog */}
            <AlertDialog open={!!deletingMessageId} onOpenChange={() => setDeletingMessageId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contact Message</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this contact message? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteContact}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

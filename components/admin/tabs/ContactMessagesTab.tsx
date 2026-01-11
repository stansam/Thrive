"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContactMessages, useUpdateContactMessage, useDeleteContactMessage } from "@/lib/hooks/use-admin-api";
import { Eye, Edit, Trash, ChevronLeft, ChevronRight, Mail, AlertCircle } from "lucide-react";
import type { ContactMessage } from "@/lib/types/admin.d.ts";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactMessagesTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [editingContactId, setEditingContactId] = useState<string | null>(null);
    const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

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
        if (!editingContactId) return;

        try {
            await updateContact(editingContactId, editForm);
            setEditingContactId(null);
            setEditForm({});
            refresh();
            alert("Contact message updated successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to update contact message");
        }
    };

    const handleDeleteContact = async () => {
        if (!deleteContactId) return;

        try {
            await deleteContact(deleteContactId);
            setDeleteContactId(null);
            refresh();
            alert("Contact message deleted successfully!");
        } catch (error: any) {
            alert(error?.message || "Failed to delete contact message");
        }
    };

    const openViewModal = (contact: ContactMessage) => {
        setSelectedContactId(contact.id);
        setSelectedContact(contact);
    };

    const openEditModal = (contact: ContactMessage) => {
        setEditingContactId(contact.id);
        setEditingContact(contact);
        setEditForm({
            status: contact.status,
            priority: contact.priority,
            adminNotes: contact.admin_notes || "",
        });
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
                <div className="flex gap-4">
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
            </Card>

            {/* Contact Messages Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
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
                                        <td colSpan={7} className="px-6 py-4">
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : contacts?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No contact messages found
                                    </td>
                                </tr>
                            ) : (
                                contacts?.map((contact: ContactMessage) => (
                                    <tr key={contact.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {contact.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {contact.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {contact.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`capitalize ${getStatusColor(contact.status)}`}>
                                                {contact.status.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`capitalize ${getPriorityColor(contact.priority)}`}>
                                                {contact.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(contact.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openViewModal(contact)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(contact)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeleteContactId(contact.id)}
                                                >
                                                    <Trash className="w-4 h-4" />
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

            {/* View Contact Modal */}
            <Dialog open={!!selectedContactId} onOpenChange={() => setSelectedContactId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Contact Message Details</DialogTitle>
                        <DialogDescription>From {selectedContact?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Name</Label>
                                    <p className="font-medium">{selectedContact.name}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Email</Label>
                                    <p className="font-medium">{selectedContact.email}</p>
                                </div>
                                {selectedContact.phone && (
                                    <div>
                                        <Label className="text-gray-600">Phone</Label>
                                        <p className="font-medium">{selectedContact.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-gray-600">Date</Label>
                                    <p className="font-medium">
                                        {new Date(selectedContact.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Status</Label>
                                    <Badge className={getStatusColor(selectedContact.status)}>
                                        {selectedContact.status.replace("_", " ")}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Priority</Label>
                                    <Badge className={getPriorityColor(selectedContact.priority)}>
                                        {selectedContact.priority}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="text-gray-600 mb-2 block">Subject</Label>
                                <p className="font-medium">{selectedContact.subject}</p>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="text-gray-600 mb-2 block">Message</Label>
                                <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>

                            {selectedContact.admin_notes && (
                                <div className="border-t pt-4 bg-yellow-50 p-4 rounded">
                                    <Label className="text-gray-600 mb-2 block">Admin Notes</Label>
                                    <p className="text-sm whitespace-pre-wrap">{selectedContact.admin_notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Contact Modal */}
            <Dialog open={!!editingContactId} onOpenChange={() => setEditingContactId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Contact Message</DialogTitle>
                        <DialogDescription>
                            Update status, priority, and add admin notes
                        </DialogDescription>
                    </DialogHeader>
                    {editingContact && (
                        <div className="space-y-4">
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
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingContactId(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateContact}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Contact Dialog */}
            <AlertDialog open={!!deleteContactId} onOpenChange={() => setDeleteContactId(null)}>
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
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

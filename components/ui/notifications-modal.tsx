"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bell, Check, Trash2 } from "lucide-react"

export interface Notification {
    id: string
    title: string
    body: string
    time: string
    read: boolean
}

interface NotificationsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notifications: Notification[]
    onMarkRead: (id: string) => void
    onDelete: (id: string) => void
}

export function NotificationsModal({
    open,
    onOpenChange,
    notifications,
    onMarkRead,
    onDelete
}: NotificationsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        All Notifications
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Manage your alerts and updates.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-white/40">
                            No notifications found.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-lg flex items-start justify-between gap-4 transition-colors ${notif.read ? 'bg-white/5' : 'bg-white/10 border-l-2 border-[#88734C]'}`}
                            >
                                <div className="flex-1">
                                    <h4 className={`font-medium ${notif.read ? 'text-white/70' : 'text-white'}`}>
                                        {notif.title}
                                    </h4>
                                    <p className="text-sm text-white/50 mt-1">{notif.body}</p>
                                    <span className="text-xs text-[#88734C] mt-2 block opacity-80">{notif.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!notif.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-white/10 text-white/70 hover:text-white"
                                            onClick={() => onMarkRead(notif.id)}
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                        onClick={() => onDelete(notif.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

"use client";

import { Card } from "@/components/ui/card";
import { useContactMessages } from "@/lib/hooks/use-admin-api";

export default function ContactMessagesTab() {
    const { contacts, isLoading } = useContactMessages({ page: 1 });

    return (
        <Card className="p-6">
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Contact Messages</h3>
                <p className="text-gray-600">
                    {isLoading ? "Loading..." : `${contacts?.length || 0} messages found`}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                    Full contact message management interface coming soon
                </p>
            </div>
        </Card>
    );
}

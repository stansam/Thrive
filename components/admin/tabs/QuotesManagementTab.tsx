"use client";

import { Card } from "@/components/ui/card";
import { useQuotes } from "@/lib/hooks/use-admin-api";

export default function QuotesManagementTab() {
    const { quotes, isLoading } = useQuotes({ page: 1 });

    return (
        <Card className="p-6">
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Quotes Management</h3>
                <p className="text-gray-600">
                    {isLoading ? "Loading..." : `${quotes?.length || 0} quotes found`}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                    Full quotes management interface coming soon
                </p>
            </div>
        </Card>
    );
}

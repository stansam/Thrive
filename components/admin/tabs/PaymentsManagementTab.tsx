"use client";

import { Card } from "@/components/ui/card";
import { usePayments } from "@/lib/hooks/use-admin-api";

export default function PaymentsManagementTab() {
    const { payments, isLoading } = usePayments({ page: 1 });

    return (
        <Card className="p-6">
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Payments Management</h3>
                <p className="text-gray-600">
                    {isLoading ? "Loading..." : `${payments?.length || 0} payments found`}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                    Full payments and refund management interface coming soon
                </p>
            </div>
        </Card>
    );
}

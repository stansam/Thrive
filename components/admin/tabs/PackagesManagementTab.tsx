"use client";

import { Card } from "@/components/ui/card";
import { usePackages } from "@/lib/hooks/use-admin-api";

export default function PackagesManagementTab() {
    const { packages, isLoading } = usePackages({ page: 1 });

    return (
        <Card className="p-6">
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Packages Management</h3>
                <p className="text-gray-600">
                    {isLoading ? "Loading..." : `${packages?.length || 0} packages found`}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                    Full packages CRUD interface coming soon
                </p>
            </div>
        </Card>
    );
}

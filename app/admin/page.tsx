"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

export default function AdminPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in and has admin role
        const checkAdminAccess = async () => {
            const token = localStorage.getItem("accessToken");
            const userRaw = localStorage.getItem("user");
            const user = JSON.parse(userRaw || "{}");

            if (!token) {
                router.push("/sign-in");
                return;
            }
            if (user.role !== "admin") {
                alert("Access denied. Admin privileges required.");
                router.push("/dashboard");
                return;
            }

            setIsLoading(false);
        };

        checkAdminAccess();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return <AdminDashboardLayout />;
}

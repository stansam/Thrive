import DemoDashboard from "@/components/dashboard-demo";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Dashboard | Thrive",
    description: "View your analytics and user stats.",
};

export default function DashboardPage() {
    return <DemoDashboard />;
}

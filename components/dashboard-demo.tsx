"use client"

import FeaturesDetail from "@/components/ui/features-detail";
import Navbar from "@/components/ui/navbar";

export default function DemoDashboard() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-20">
                <FeaturesDetail />
            </div>
        </div>
    );
}

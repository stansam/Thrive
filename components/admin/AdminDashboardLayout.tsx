"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
    LayoutDashboard,
    Users,
    Calendar,
    HelpCircle,
    Package,
    CreditCard,
    Mail,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AdminDashboardTab from "@/components/admin/tabs/AdminDashboardTab";
import UsersManagementTab from "@/components/admin/tabs/UsersManagementTab";
import BookingsManagementTab from "@/components/admin/tabs/BookingsManagementTab";
import QuotesManagementTab from "@/components/admin/tabs/QuotesManagementTab";
import PackagesManagementTab from "@/components/admin/tabs/PackagesManagementTab";
import PaymentsManagementTab from "@/components/admin/tabs/PaymentsManagementTab";
import ContactMessagesTab from "@/components/admin/tabs/ContactMessagesTab";
import { useAuth } from "@/lib/auth-context";

interface TabConfig {
    id: string;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
}

export default function AdminDashboardLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    const { logout, user } = useAuth();

    const tabs: TabConfig[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
            component: <AdminDashboardTab />,
        },
        {
            id: "users",
            label: "Users",
            icon: <Users className="w-5 h-5" />,
            component: <UsersManagementTab />,
        },
        {
            id: "bookings",
            label: "Bookings",
            icon: <Calendar className="w-5 h-5" />,
            component: <BookingsManagementTab />,
        },
        {
            id: "quotes",
            label: "Quotes",
            icon: <HelpCircle className="w-5 h-5" />,
            component: <QuotesManagementTab />,
        },
        {
            id: "packages",
            label: "Packages",
            icon: <Package className="w-5 h-5" />,
            component: <PackagesManagementTab />,
        },
        {
            id: "payments",
            label: "Payments",
            icon: <CreditCard className="w-5 h-5" />,
            component: <PaymentsManagementTab />,
        },
        {
            id: "contacts",
            label: "Contact Messages",
            icon: <Mail className="w-5 h-5" />,
            component: <ContactMessagesTab />,
        },
    ];

    const handleLogout = () => {
        logout();
    };

    const currentTab = tabs.find((tab) => tab.id === activeTab);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } bg-gradient-to-b from-indigo-600 to-purple-700 text-white transition-all duration-300 ease-in-out flex flex-col`}
            >
                {/* Header */}
                <div className="p-6 border-b border-indigo-500/50">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && (
                            <h1 className="text-2xl font-bold">Admin Panel</h1>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-white hover:bg-white/10"
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-lg"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {tab.icon}
                            {sidebarOpen && (
                                <span className="font-medium">{tab.label}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-indigo-500/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {currentTab?.label}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Manage and monitor your platform
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.email || "Admin"}
                                </p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tab Content */}
                <div className="p-8">{currentTab?.component}</div>
            </main>
        </div>
    );
}

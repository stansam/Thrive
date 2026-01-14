"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    Bell,
    Settings,
    Briefcase,
    ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

// Admin Tabs Components
import AdminDashboardTab from "@/components/admin/tabs/AdminDashboardTab";
import UsersManagementTab from "@/components/admin/tabs/UsersManagementTab";
import BookingsManagementTab from "@/components/admin/tabs/BookingsManagementTab";
import QuotesManagementTab from "@/components/admin/tabs/QuotesManagementTab";
import PackagesManagementTab from "@/components/admin/tabs/PackagesManagementTab";
import PaymentsManagementTab from "@/components/admin/tabs/PaymentsManagementTab";
import ContactMessagesTab from "@/components/admin/tabs/ContactMessagesTab";

export default function AdminDashboardLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { logout, user } = useAuth();

    // Accordion State
    const [accordionValue, setAccordionValue] = useState<string>("");

    // Sync accordion state on tab change
    useEffect(() => {
        if (["users", "bookings"].includes(activeTab)) {
            setAccordionValue("operations");
        } else if (["packages", "quotes", "payments"].includes(activeTab)) {
            setAccordionValue("commerce");
        }
    }, [activeTab]);

    const handleLogout = () => {
        logout();
        router.push("/sign-in");
    };

    const userInitials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : "AD";

    // Tab content mapping
    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <AdminDashboardTab />;
            case "users": return <UsersManagementTab />;
            case "bookings": return <BookingsManagementTab />;
            case "quotes": return <QuotesManagementTab />;
            case "packages": return <PackagesManagementTab />;
            case "payments": return <PaymentsManagementTab />;
            case "contacts": return <ContactMessagesTab />;
            default: return <AdminDashboardTab />;
        }
    };

    const getTabTitle = () => {
        const titles: Record<string, string> = {
            dashboard: "Dashboard Overview",
            users: "User Management",
            bookings: "Booking Management",
            quotes: "Quote Requests",
            packages: "Travel Packages",
            payments: "Payments & Financials",
            contacts: "Contact Messages"
        };
        return titles[activeTab] || "Admin Dashboard";
    };

    const NavigationContent = ({ isMobile = false }) => (
        <div className="flex-1 overflow-auto py-4">
            <nav className="flex flex-col px-4 text-sm font-medium gap-1">
                {/* Dashboard */}
                <button
                    onClick={() => {
                        setActiveTab("dashboard");
                        if (isMobile) setMobileMenuOpen(false);
                    }}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                        activeTab === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                        isMobile ? "text-sm" : "text-sm font-medium"
                    )}
                >
                    <LayoutDashboard className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                    Dashboard
                </button>

                {/* Operations Accordion */}
                <Accordion
                    type="single"
                    collapsible
                    className="w-full border-none"
                    value={accordionValue === "operations" ? "operations" : ""}
                    onValueChange={(val) => setAccordionValue(val)}
                >
                    <AccordionItem value="operations" className="border-none">
                        <AccordionTrigger
                            className={cn(
                                "py-2 px-3 text-muted-foreground hover:text-primary hover:bg-muted hover:no-underline rounded-lg",
                                (["users", "bookings"].includes(activeTab)) ? "text-primary font-semibold" : ""
                            )}
                        >
                            <span className={cn("flex items-center gap-3", isMobile ? "text-sm" : "text-sm font-medium")}>
                                <Briefcase className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Operations
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pl-1">
                            <div className="flex flex-col gap-1 mt-1 border-l-2 border-neutral-100 dark:border-neutral-800 pl-2">
                                <button
                                    onClick={() => {
                                        setActiveTab("users");
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                                        activeTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                                        isMobile ? "text-sm" : "text-sm font-medium"
                                    )}
                                >
                                    <Users className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Users
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab("bookings");
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                                        activeTab === "bookings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                                        isMobile ? "text-sm" : "text-sm font-medium"
                                    )}
                                >
                                    <Calendar className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Bookings
                                </button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Commerce Accordion */}
                <Accordion
                    type="single"
                    collapsible
                    className="w-full border-none"
                    value={accordionValue === "commerce" ? "commerce" : ""}
                    onValueChange={(val) => setAccordionValue(val)}
                >
                    <AccordionItem value="commerce" className="border-none">
                        <AccordionTrigger
                            className={cn(
                                "py-2 px-3 text-muted-foreground hover:text-primary hover:bg-muted hover:no-underline rounded-lg",
                                (["packages", "quotes", "payments"].includes(activeTab)) ? "text-primary font-semibold" : ""
                            )}
                        >
                            <span className={cn("flex items-center gap-3", isMobile ? "text-sm" : "text-sm font-medium")}>
                                <ShoppingCart className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Commerce
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pl-1">
                            <div className="flex flex-col gap-1 mt-1 border-l-2 border-neutral-100 dark:border-neutral-800 pl-2">
                                <button
                                    onClick={() => {
                                        setActiveTab("packages");
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                                        activeTab === "packages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                                        isMobile ? "text-sm" : "text-sm font-medium"
                                    )}
                                >
                                    <Package className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Packages
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab("quotes");
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                                        activeTab === "quotes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                                        isMobile ? "text-sm" : "text-sm font-medium"
                                    )}
                                >
                                    <HelpCircle className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Quotes
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab("payments");
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                                        activeTab === "payments" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                                        isMobile ? "text-sm" : "text-sm font-medium"
                                    )}
                                >
                                    <CreditCard className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> Payments
                                </button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Support - Flat */}
                <button
                    onClick={() => {
                        setActiveTab("contacts");
                        if (isMobile) setMobileMenuOpen(false);
                    }}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                        activeTab === "contacts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary hover:bg-muted",
                        isMobile ? "text-sm" : "text-sm font-medium"
                    )}
                >
                    <Mail className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                    Messages
                </button>
            </nav>
        </div>
    );



    return (
        <div className="flex h-screen w-full flex-col bg-muted/20 md:flex-row overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex h-full shrink-0">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <LayoutDashboard className="h-6 w-6 text-indigo-600" />
                        <span>Thrive Admin</span>
                    </Link>
                </div>

                <NavigationContent />

                <div className="mt-auto border-t p-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Log out</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Sign out of your account</TooltipContent>
                    </Tooltip>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex h-14 items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <LayoutDashboard className="h-6 w-6 text-indigo-600" />
                            <span>Thrive Admin</span>
                        </Link>
                    </div>
                    <NavigationContent isMobile={true} />
                </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open navigation menu</TooltipContent>
                    </Tooltip>

                    <div className="flex-1">
                        <h1 className="text-lg font-semibold md:text-2xl">
                            {getTabTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Admin Badge */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium">{user?.email}</span>
                            <span className="text-xs text-muted-foreground uppercase">Administrator</span>
                        </div>

                        {/* User Menu */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="bg-indigo-600 text-white">{userInitials}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Account settings</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

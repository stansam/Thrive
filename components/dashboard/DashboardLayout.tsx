"use client"

/**
 * Main Dashboard Layout Component
 * Provides fixed sidebar navigation and dynamic content area for dashboard tabs
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Plane,
    MapPin,
    MessageSquare,
    Users,
    CreditCard,
    Settings,
    LogOut,
    LifeBuoy,
    Bell,
    Menu,
    Package as PackageIcon,
    Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from '@/lib/auth-context';
import { useProfile, useNotifications } from '@/lib/hooks/use-dashboard-api';
import type { Notification } from '@/lib/types/dashboard';
import { cn } from '@/lib/utils';

// Tab configuration
export type DashboardTab = 'dashboard' | 'flights' | 'my-packages' | 'explore-packages' | 'contact' | 'profile' | 'subscriptions' | 'settings';

interface TabConfig {
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    section?: 'main' | 'sidebar';
}

const tabs: TabConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare, section: 'main' },
    { id: 'profile', label: 'Profile', icon: Users, section: 'sidebar' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, section: 'sidebar' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'sidebar' },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
    const router = useRouter();
    const { logout } = useAuth();
    const { profile } = useProfile();
    const { notifications } = useNotifications({ unreadOnly: true, perPage: 5 });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Accordion State
    const [mainAccordionValue, setMainAccordionValue] = useState<string>('');
    const [subAccordionValue, setSubAccordionValue] = useState<string>('');

    // Sync Accordion state with Active Tab
    useEffect(() => {
        if (activeTab === 'flights') {
            setMainAccordionValue('my-trips');
        } else if (activeTab === 'my-packages' || activeTab === 'explore-packages') {
            setMainAccordionValue('my-trips');
            setSubAccordionValue('packages');
        }
    }, [activeTab]);

    const handleLogout = async () => {
        logout();
        // router.push('/signin'); // logout in context already redirects
    };

    const unreadCount = notifications?.length || 0;
    const userInitials = profile
        ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
        : 'U';

    const sidebarTabs = tabs.filter(t => t.section === 'sidebar');

    const renderNavLink = (tab: TabConfig, isMobile = false) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
            <button
                key={tab.id}
                onClick={() => {
                    onTabChange(tab.id);
                    if (isMobile) setMobileMenuOpen(false);
                }}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted',
                    isMobile ? 'text-lg' : 'text-sm font-medium'
                )}
            >
                <Icon className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
                {tab.label}
            </button>
        );
    };

    const NavigationContent = ({ isMobile = false }) => (
        <div className="flex-1 overflow-auto py-4">
            <nav className="flex flex-col px-4 text-sm font-medium gap-1">
                {renderNavLink({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, isMobile)}

                {/* My Trips Accordion */}
                <Accordion
                    type="single"
                    collapsible
                    className="w-full border-none"
                    value={mainAccordionValue}
                    onValueChange={setMainAccordionValue}
                >
                    <AccordionItem value="my-trips" className="border-none">
                        <AccordionTrigger
                            className={cn(
                                "py-2 px-3 text-muted-foreground hover:text-primary hover:bg-muted hover:no-underline rounded-lg",
                                (activeTab === 'flights' || activeTab === 'my-packages' || activeTab === 'explore-packages') ? 'text-primary font-semibold' : ''
                            )}
                        >
                            <span className={cn("flex items-center gap-3", isMobile ? 'text-lg' : 'text-sm font-medium')}>
                                <MapPin className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} /> My Trips
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pl-1">
                            <div className="flex flex-col gap-1 mt-1 border-l-2 border-neutral-100 dark:border-neutral-800 pl-2">
                                <button
                                    onClick={() => {
                                        onTabChange('flights');
                                        if (isMobile) setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left",
                                        activeTab === 'flights' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted',
                                        isMobile ? 'text-lg' : 'text-sm font-medium'
                                    )}
                                >
                                    <Plane className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} /> Flights
                                </button>

                                {/* Packages Nested Accordion */}
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full border-none"
                                    value={subAccordionValue}
                                    onValueChange={setSubAccordionValue}
                                >
                                    <AccordionItem value="packages" className="border-none">
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 px-3 text-muted-foreground hover:text-primary hover:bg-muted hover:no-underline rounded-lg",
                                                (activeTab === 'my-packages' || activeTab === 'explore-packages') ? 'text-primary font-semibold' : ''
                                            )}
                                        >
                                            <span className={cn("flex items-center gap-3", isMobile ? 'text-lg' : 'text-sm font-medium')}>
                                                <PackageIcon className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} /> Packages
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-0 pl-2">
                                            <div className="flex flex-col gap-1 mt-1 border-l-2 border-neutral-100 dark:border-neutral-800 pl-2">
                                                <button
                                                    onClick={() => {
                                                        onTabChange('my-packages');
                                                        if (isMobile) setMobileMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-1 py-1 transition-all w-full text-left",
                                                        activeTab === 'my-packages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted',
                                                        isMobile ? 'text-sm' : 'text-sm font-medium'
                                                    )}
                                                >
                                                    <PackageIcon className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} /> My Packages
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onTabChange('explore-packages');
                                                        if (isMobile) setMobileMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-1 py-1 transition-all w-full text-left",
                                                        activeTab === 'explore-packages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted',
                                                        isMobile ? 'text-sm' : 'text-sm font-medium'
                                                    )}
                                                >
                                                    <Compass className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} /> Explore Packages
                                                </button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                {renderNavLink({ id: 'contact', label: 'Contact Us', icon: MessageSquare }, isMobile)}
            </nav>

            {/* Sidebar Sections */}
            <div className="mt-6 px-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                    ACCOUNT
                </div>
                <nav className="grid items-start gap-1">
                    {sidebarTabs.map(tab => renderNavLink(tab, isMobile))}
                </nav>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-full flex-col bg-muted/20 md:flex-row overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex h-full shrink-0">
                {/* Logo */}
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <LayoutDashboard className="h-6 w-6" />
                        <span>Thrive Agency</span>
                    </Link>
                </div>

                {/* Main Navigation */}
                <NavigationContent />

                {/* Bottom Actions */}
                <div className="mt-auto border-t p-4">
                    <button
                        onClick={() => onTabChange('contact')}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                    >
                        <LifeBuoy className="h-4 w-4" />
                        <span>Help & Support</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                    {/* Mobile Menu Toggle */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="flex h-14 items-center border-b px-6">
                                <Link href="/" className="flex items-center gap-2 font-semibold">
                                    <LayoutDashboard className="h-6 w-6" />
                                    <span>Thrive Agency</span>
                                </Link>
                            </div>
                            <NavigationContent isMobile={true} />
                            <div className="border-t p-4">
                                <button
                                    onClick={() => {
                                        onTabChange('contact');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <LifeBuoy className="h-5 w-5" />
                                    <span>Help & Support</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Page Title */}
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold md:text-2xl capitalize">
                            {activeTab.replace(/-/g, ' ') || 'Dashboard'}
                        </h1>
                    </div>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="relative">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Badge>
                                )}
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notification: Notification) => (
                                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                                        <div className="font-medium">{notification.title}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No new notifications
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={profile?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${profile.firstName} ${profile.lastName}` : undefined} />
                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {profile?.firstName} {profile?.lastName}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {profile?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onTabChange('profile')}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTabChange('subscriptions')}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Subscriptions</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTabChange('settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Main Content - Scrollable */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

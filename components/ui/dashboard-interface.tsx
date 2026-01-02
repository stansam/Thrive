"use client"

import { logout } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
    Activity,
    CreditCard,
    DollarSign,
    Download,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    PieChart,
    Settings,
    Users,
    Wallet,
} from "lucide-react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardInterface() {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<Array<{ name: string; total: number }>>([]);

    useEffect(() => {
        // Generate chart data only on client side to prevent hydration mismatch
        setData([
            {
                name: "Jan",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Feb",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Mar",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Apr",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "May",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Jun",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Jul",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Aug",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Sep",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Oct",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Nov",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
            {
                name: "Dec",
                total: Math.floor(Math.random() * 5000) + 1000,
            },
        ]);
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering interactive components until mounted
    if (!mounted) {
        return (
            <div className="flex h-full w-full flex-col bg-muted/20 md:flex-row overflow-hidden">
                {/* Sidebar Skeleton */}
                <aside className="hidden w-64 flex-col border-r bg-background md:flex h-full shrink-0">
                    <div className="flex h-14 items-center border-b px-6">
                        <div className="flex items-center gap-2 font-semibold">
                            <LayoutDashboard className="h-6 w-6" />
                            <span>Thrive Agency</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <div className="px-4 space-y-2">
                            <div className="h-10 bg-muted rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </aside>

                {/* Main Content Skeleton */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                        <div className="w-full flex-1">
                            <div className="h-10 w-1/3 bg-muted rounded-md animate-pulse" />
                        </div>
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:gap-8 md:p-8">
                        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                        <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
                            <div className="col-span-4 h-96 bg-muted rounded-lg animate-pulse" />
                            <div className="col-span-3 h-96 bg-muted rounded-lg animate-pulse" />
                        </div>
                    </main>
                </div>
            </div>
        );
    }
    return (
        <div className="flex h-full w-full flex-col bg-muted/20 md:flex-row overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex h-full shrink-0">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <LayoutDashboard className="h-6 w-6" />
                        <span>Thrive Agency</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-all hover:text-primary-foreground"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <Users className="h-4 w-4" />
                            Profile
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <CreditCard className="h-4 w-4" />
                            Subscriptions
                        </Link>
                        {/* <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <PieChart className="h-4 w-4" />
                            Analytics
                        </Link> */}
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                    </nav>
                </div>
                <div className="mt-auto border-t p-4">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer">
                        <LifeBuoy className="h-4 w-4" />
                        <span className="text-sm font-medium">Help & Support</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Log out</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="md:hidden">
                                <LayoutDashboard className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs">
                            <nav className="grid gap-6 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-4 px-2.5 text-foreground"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Thrive Agency
                                </Link>
                                <Link
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Profile
                                </Link>
                                {/* <Link
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Analytics
                                </Link> */}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">🔍</span>
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:gap-8 md:p-8">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <div className="flex items-center space-x-2">
                            <Button>Download Report</Button>
                        </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$45,231.89</div>
                                <p className="text-xs text-muted-foreground">
                                    +20.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Subscriptions
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +180.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12,234</div>
                                <p className="text-xs text-muted-foreground">
                                    +19% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Now
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">
                                    +201 since last hour
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
                        {/* Overview Chart */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>
                                    Your revenue overview for the current year.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                                            itemStyle={{ color: 'var(--color-foreground)' }}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="var(--color-primary)"
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Sales */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                    You made 265 sales this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                            <AvatarFallback>OM</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                            <p className="text-sm text-muted-foreground">
                                                olivia.martin@email.com
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">+$1,999.00</div>
                                    </div>
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/02.png" alt="Avatar" />
                                            <AvatarFallback>JL</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                            <p className="text-sm text-muted-foreground">
                                                jackson.lee@email.com
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">+$39.00</div>
                                    </div>
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/03.png" alt="Avatar" />
                                            <AvatarFallback>IN</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Isabella Nguyen</p>
                                            <p className="text-sm text-muted-foreground">
                                                isabella.nguyen@email.com
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">+$299.00</div>
                                    </div>
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/04.png" alt="Avatar" />
                                            <AvatarFallback>WK</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">William Kim</p>
                                            <p className="text-sm text-muted-foreground">
                                                will@email.com
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">+$99.00</div>
                                    </div>
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/05.png" alt="Avatar" />
                                            <AvatarFallback>SD</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Sofia Davis</p>
                                            <p className="text-sm text-muted-foreground">
                                                sofia.davis@email.com
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">+$39.00</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}

import Link from "next/link"

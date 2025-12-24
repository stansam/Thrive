"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Phone, Bell, Menu, User, LogOut, Settings } from "lucide-react"
import { NotificationsModal, Notification } from './notifications-modal'

// --- Types ---
type NavItem = {
    label: string
    href: string
}

type MobileNavProps = {
    links: NavItem[]
}

// --- Mobile Nav Component ---
function MobileNav({ links }: MobileNavProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-white/10"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-full h-[calc(100vh-8rem)] overflow-y-auto bg-black border-none p-6 text-white"
                align="start"
                side="bottom"
            >
                <div className="flex flex-col gap-6">
                    <p className="font-semibold text-lg border-b border-white/10 pb-2">Menu</p>
                    {links.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="text-xl font-medium text-white/80 hover:text-[#88734C]"
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-8 border-t border-white/10 pt-4">
                        <p className="text-sm text-white/60 mb-2">Need help?</p>
                        <p className="text-[#88734C] font-mono text-lg">+123456789</p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

// --- Main Navbar Component ---

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Flight Confirmed',
            body: 'Your booking to Dubai (DBX) has been confirmed.',
            time: '2 mins ago',
            read: false
        },
        {
            id: '2',
            title: 'New Quote Available',
            body: 'We have prepared the quote for your group trip to Bali.',
            time: '1 hour ago',
            read: false
        },
        {
            id: '3',
            title: 'Welcome to Thrive!',
            body: 'Your account has been successfully created.',
            time: '1 day ago',
            read: true
        }
    ])

    const unreadCount = notifications.filter(n => !n.read).length
    const recentNotifications = notifications.slice(0, 3)

    const navLinks: NavItem[] = [
        { label: 'Services', href: '#services' },
        { label: 'Tours', href: '#featured-tours' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'About', href: '#about-section' },
    ]

    const handleMarkRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    return (
        <>
            {/* Top Strip */}
            <div className="bg-black text-white py-2 px-4 text-xs md:text-sm font-medium border-b border-white/10 relative z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <span className="hidden sm:inline text-white/70">Premium Travel Services</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[#88734C] animate-pulse">Urgent flight or quote?</span>
                        <span>WhatsApp: <a href="https://wa.me/123456789" className="hover:text-[#88734C] transition-colors font-mono">+123456789</a></span>
                    </div>
                </div>
            </div>

            {/* Sticky Navbar */}
            <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/80 border-b border-white/5 transition-all duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-white tracking-tight">
                            THRIVE<span className="text-[#88734C]">.</span>
                        </Link>

                        <div className="hidden md:flex">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {navLinks.map((link, index) => (
                                        <NavigationMenuItem key={index}>
                                            <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer")}>
                                                <Link href={link.href}>
                                                    {link.label}
                                                </Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Auth Toggle (Demo purpose) */}
                        <div className="hidden lg:flex items-center space-x-2 mr-4 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            <Switch
                                id="auth-mode"
                                checked={isLoggedIn}
                                onCheckedChange={setIsLoggedIn}
                            />
                            <Label htmlFor="auth-mode" className="text-xs text-white/60 cursor-pointer">
                                {isLoggedIn ? 'User Mode' : 'Guest Mode'}
                            </Label>
                        </div>

                        {isLoggedIn ? (
                            <>
                                {/* Notification Bell */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                                            <Bell className="h-5 w-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#88734C] animate-pulse" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80 bg-[#1a1a1a] border-white/10 text-white">
                                        <DropdownMenuLabel className="flex justify-between items-center">
                                            <span>Notifications</span>
                                            {unreadCount > 0 && (
                                                <span onClick={markAllRead} className="text-xs font-normal text-[#88734C] cursor-pointer hover:underline">Mark all read</span>
                                            )}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        {recentNotifications.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-white/50">No new notifications</div>
                                        ) : (
                                            recentNotifications.map(notif => (
                                                <DropdownMenuItem key={notif.id} className="cursor-pointer focus:bg-white/5 p-3 flex flex-col items-start gap-1">
                                                    <div className="flex justify-between w-full">
                                                        <span className={`font-medium text-sm ${notif.read ? 'text-white/60' : 'text-white'}`}>{notif.title}</span>
                                                        {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-[#88734C]" />}
                                                    </div>
                                                    <p className="text-xs text-white/50 line-clamp-2">{notif.body}</p>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <div className="p-2">
                                            <Button
                                                variant="outline"
                                                className="w-full h-8 text-xs border-white/20 hover:bg-white/10 hover:text-white"
                                                onClick={() => setIsModalOpen(true)}
                                            >
                                                View all notifications
                                            </Button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* User Profile */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                            <Avatar className="h-8 w-8 border border-white/20">
                                                <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-white/10 text-white" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">Traveler</p>
                                                <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem className="focus:bg-white/5 cursor-pointer text-red-400 focus:text-red-400">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Link href="/sign-in">
                                <Button className="bg-[#88734C] hover:bg-[#7a6540] text-white">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                        {!isLoggedIn && (
                            <Button className="bg-white text-black hover:bg-neutral-200">
                                Get Started
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <MobileNav links={navLinks} />
                    </div>
                </div>
            </header>

            {/* Notifications Modal */}
            <NotificationsModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
            />
        </>
    )
}

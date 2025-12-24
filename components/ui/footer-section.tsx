"use client"

import Link from 'next/link'
import {
    Globe,
    Share2,
    MessageCircle,
    Link as LinkIcon,
    Send,
    Feather,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const links = [
    {
        title: 'Services',
        href: '#services',
    },
    {
        title: 'Tours',
        href: '#featured-tours',
    },
    {
        title: 'Pricing',
        href: '#pricing',
    },
    {
        title: 'About Us',
        href: '#about-section',
    },
]

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-24 bg-black text-white border-t border-white/10">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col items-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Thrive Global Travel & Tours</h3>
                    <p className="text-white/60 text-center max-w-md">
                        Your premium partner for stress-free travel, flight bookings, and corporate solutions.
                    </p>
                </div>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-white/60 hover:text-[#88734C] block duration-150 font-medium">
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-[#88734C] block transition-colors">
                        <Facebook className="size-5" />
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-[#88734C] block transition-colors">
                        <Instagram className="size-5" />
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-[#88734C] block transition-colors">
                        <Twitter className="size-5" />
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-[#88734C] block transition-colors">
                        <Linkedin className="size-5" />
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12 pt-8 border-t border-white/5 text-xs text-white/40">
                    <span>© {new Date().getFullYear()} Thrive Global Travel & Tours. All rights reserved.</span>

                    <div className="flex gap-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="hover:text-white transition-colors">Privacy Policy</button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-white/10">
                                <DialogHeader>
                                    <DialogTitle>Privacy Policy</DialogTitle>
                                    <DialogDescription className="text-white/60">
                                        Last updated: {new Date().toLocaleDateString()}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 text-sm text-white/80 mt-4">
                                    <p>At Thrive Global Travel & Tours, we value your privacy. This policy outlines how we collect, use, and protect your personal information.</p>
                                    <h4 className="font-bold text-white">1. Information Collection</h4>
                                    <p>We collect information necessary to process your bookings, such as name, contact details, passport information, and payment details.</p>
                                    <h4 className="font-bold text-white">2. Use of Information</h4>
                                    <p>Your data is used solely for travel arrangements, communication regarding your trip, and improving our services.</p>
                                    <h4 className="font-bold text-white">3. Data Protection</h4>
                                    <p>We implement security measures to protect your personal information from unauthorized access.</p>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="hover:text-white transition-colors">Terms of Use</button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-white/10">
                                <DialogHeader>
                                    <DialogTitle>Terms of Use</DialogTitle>
                                    <DialogDescription className="text-white/60">
                                        Please read these terms carefully before using our services.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 text-sm text-white/80 mt-4">
                                    <h4 className="font-bold text-white">1. Booking & Payments</h4>
                                    <p>All bookings are subject to availability and confirmation. Prices are subject to change until tickets are issued.</p>
                                    <h4 className="font-bold text-white">2. Cancellations & Refunds</h4>
                                    <p>Cancellation policies vary by airline and service provider. Thrive Global Travel & Tours service fees are non-refundable.</p>
                                    <h4 className="font-bold text-white">3. Travel Documents</h4>
                                    <p>Travelers are responsible for ensuring they have valid passports, visas, and other necessary travel documents.</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </footer>
    )
}

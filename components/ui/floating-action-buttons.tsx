"use client"

import { useState, useEffect } from "react"
import { ArrowUp, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function FloatingActionButtons() {
    const [showBackToTop, setShowBackToTop] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowBackToTop(true)
            } else {
                setShowBackToTop(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {/* WhatsApp Button */}
            <motion.a
                href="https://wa.me/123456789"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors flex items-center justify-center"
                aria-label="Contact on WhatsApp"
            >
                <MessageCircle className="h-6 w-6 fill-current" />
            </motion.a>

            {/* Back to Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={scrollToTop}
                        className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

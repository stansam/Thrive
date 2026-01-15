"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePackagesApi } from "@/lib/hooks/use-packages-api"
import { useToast } from "@/hooks/use-toast"

interface WishlistButtonProps {
    packageId: string
    initialIsSaved?: boolean
    className?: string
    variant?: "default" | "outline" | "ghost" | "icon"
}

export function WishlistButton({
    packageId,
    initialIsSaved = false,
    className,
    variant = "icon"
}: WishlistButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [isLoading, setIsLoading] = useState(false)
    const { toggleWishlist } = usePackagesApi()
    const { toast } = useToast()

    // Sync state if initialIsSaved changes (e.g. from parent re-fetch)
    useEffect(() => {
        setIsSaved(initialIsSaved)
    }, [initialIsSaved])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLoading) return

        const newState = !isSaved
        setIsSaved(newState) // Optimistic update
        setIsLoading(true)

        try {
            await toggleWishlist(packageId, newState)
            toast({
                title: newState ? "Saved to wishlist" : "Removed from wishlist",
                description: newState ? "This package has been added to your saved trips." : "This package has been removed from your saved trips.",
            })
        } catch (error) {
            setIsSaved(!newState) // Revert
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (variant === "icon") {
        return (
            <button
                onClick={handleToggle}
                className={cn(
                    "rounded-full p-2 transition-all hover:bg-black/10 hover:scale-110 active:scale-95",
                    isSaved ? "text-red-500" : "text-white/80 hover:text-white",
                    className
                )}
                disabled={isLoading}
            >
                <Heart className={cn("h-6 w-6", isSaved && "fill-current")} />
            </button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current text-red-500")} />
            {isSaved ? "Saved" : "Save to Wishlist"}
        </Button>
    )
}

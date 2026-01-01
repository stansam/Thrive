"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import DashboardInterface from "./dashboard-interface"
import { LayoutGrid } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const dashboardTabs = [
    {
        id: 1,
        title: "Analytics",
        src: "", // No image for the first tab as it's the live component
        alt: "Dashboard Analytics Overview",
        type: "component"
    },
    {
        id: 2,
        title: "Users Management",
        src: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=2670&auto=format&fit=crop",
        alt: "Dashboard User Management",
        type: "image"
    },
    {
        id: 3,
        title: "Insights & Reports",
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
        alt: "Dashboard Reports",
        type: "image"
    },
    {
        id: 4,
        title: "Activity",
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        alt: "Dashboard Activity",
        type: "image"
    },
    {
        id: 5,
        title: "Trends",
        src: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=2670&auto=format&fit=crop",
        alt: "Dashboard Trends",
        type: "image"
    }
]

export default function FeaturesDetail() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const headingRef = useRef<HTMLHeadingElement>(null)
    const textRef = useRef<HTMLParagraphElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)
    const sliderRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Hero animation
        const tl = gsap.timeline()

        tl.fromTo(
            headingRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        )
            .fromTo(
                textRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                "-=0.4"
            )
            .fromTo(
                ctaRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                "-=0.4"
            )
            .fromTo(
                sliderRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                "-=0.2"
            )
            .fromTo(
                ".hero-blur",
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
                "-=1"
            )

        // Parallax effect on scroll
        gsap.to(".hero-blur", {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        })

        // Remove auto-slide as requested ("only switches when explicitly switched by the user")
        // const slideInterval = setInterval(() => {
        //   nextSlide()
        // }, 5000)

        return () => {
            tl.kill()
            // clearInterval(slideInterval)
        }
    }, []);

    // Function to go to next slide
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === dashboardTabs.length - 1 ? 0 : prev + 1))
    }

    // Function to go to a specific slide
    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }


    useEffect(() => {
        // Animate feature items when they come into view
        gsap.fromTo(
            ".feature-item",
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".features-grid",
                    start: "top 75%",
                }
            }
        )

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])

    return (
        <div ref={sectionRef} className="py-8 md:py-16 overflow-hidden">
            <div className="mx-auto">
                <div >
                    <div className="container flex flex-col items-center justify-center mx-auto px-4 md:px-0">
                        <h1 ref={headingRef} className="text-4xl text-center font-bold tracking-tight sm:text-5xl text-foreground">
                            Experience the World with Thrive <br />
                        </h1>
                        <i className="text-muted-foreground">CEO: Edna Kemboi</i>
                        <p ref={textRef} className="mt-4 text-lg text-muted-foreground text-center max-w-2xl">
                            Your gateway to seamless travel experiences. From flight bookings to custom itineraries, we handle the details so you can focus on the journey.
                        </p>
                    </div>

                    <div className="flex justify-center md:justify-start gap-4 md:gap-8 container mx-auto mt-8 mb-4 px-4 md:px-0 overflow-x-auto pb-2 scrollbar-hide">
                        {dashboardTabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                onClick={() => goToSlide(index)}
                                className={`p-2 text-sm font-medium transition-all whitespace-nowrap ${currentSlide === index
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {tab.id === 1 ? <LayoutGrid className="w-5 h-5" /> : tab.title}
                            </button>
                        ))}
                    </div>

                    <div
                        ref={sliderRef}
                        className="relative h-[800px] md:h-[900px] w-full overflow-hidden mt-4"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            {dashboardTabs.map((tab, index) => {
                                // Calculate position relative to current slide
                                const position = index - currentSlide;

                                // For the visible slide (position === 0)
                                const isActive = position === 0;

                                // Calculate z-index: Active is highest, immediate neighbors are lower
                                const zIndex = isActive ? 30 : 20 - Math.abs(position);

                                // Calculate scale: Active is 1, neighbors are 0.9, further away smaller
                                // We only want to transform slides that are close, otherwise hide them for performance
                                if (Math.abs(position) > 2) return null;

                                const scale = isActive ? 1 : 0.9;

                                // Translate X: 0 for active, 100% for next, -100% for prev
                                // But with a 3D effect stack or just simple slider? 
                                // The snippet suggested: `translateX(${position * 100}%)` which is a standard slider.
                                // Let's stick to the snippet's logic but ensure it centers properly.
                                const translateX = position * 100;

                                return (
                                    <div
                                        key={tab.id}
                                        className={`absolute w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-xl
                        ${isActive ? 'opacity-100' : 'opacity-40'}
                    `}
                                        style={{
                                            transform: `translateX(${translateX}%) scale(${scale})`,
                                            zIndex
                                        }}
                                    >
                                        <div className={`
                        relative w-full px-2 md:px-4 h-full mx-auto 
                        rounded-xl border border-border bg-background shadow-2xl overflow-hidden
                        ${isActive ? 'ring-1 ring-ring/10' : ''}
                    `}>
                                            {tab.type === "component" ? (
                                                <DashboardInterface />
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={tab.src}
                                                        alt={tab.alt}
                                                        fill
                                                        className="object-cover"
                                                        priority={index <= 1} // Prioritize first two
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="bg-background/90 backdrop-blur-sm p-8 rounded-xl text-center shadow-lg border border-border">
                                                            <h3 className="text-2xl font-bold text-foreground mb-2">{tab.title}</h3>
                                                            <p className="text-muted-foreground">Detailed view for {tab.title} is coming soon.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

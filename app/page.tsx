'use client'

import { useState } from 'react'
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Button } from "@/components/ui/button"
import { BookFlightForm } from "@/components/book-flight-form"
import { CustomQuoteForm } from "@/components/custom-quote-form"
import { ServicesMarquee } from "@/components/blocks/services-marquee"
import { FeaturedTours } from "@/components/blocks/featured-tours"
import { PricingSection } from "@/components/blocks/pricing-section"
import AboutUsSection from "@/components/ui/about-us-section"
import FooterSection from "@/components/ui/footer-section"
import Navbar from "@/components/ui/navbar"
import { Plane, FileText, Users, Building2, Map, Info, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    title: "Airline Ticket Booking",
    description: "Seamless domestic and international flight reservations with competitive rates.",
    icon: Plane
  },
  {
    title: "Group Travel Coordination",
    description: "Expert planning for large groups, ensuring smooth logistics and accommodation.",
    icon: Users
  },
  {
    title: "Corporate Travel Planning",
    description: "Tailored solutions for business travel, optimizing efficiency and comfort.",
    icon: Building2
  },
  {
    title: "Itinerary Planning",
    description: "Customized travel schedules designed to make the most of your trip.",
    icon: Map
  },
  {
    title: "Travel Consultation",
    description: "Guidance on visa rules, entry requirements, and destination specifics.",
    icon: Info
  },
  {
    title: "24/7 Concierge Support",
    description: "Round-the-clock assistance for any travel needs or emergencies.",
    icon: Headphones
  }
]

import { FloatingActionButtons } from "@/components/ui/floating-action-buttons"

export default function SplineSceneBasic() {
  const [activeForm, setActiveForm] = useState<'none' | 'book' | 'quote'>('none')

  const toggleForm = (form: 'book' | 'quote') => {
    setActiveForm(curr => curr === form ? 'none' : form)
  }

  return (
    <div className="min-h-screen bg-black dark font-sans">
      <Navbar />
      <FloatingActionButtons />

      {/* Hero Section */}
      <section className="flex items-center justify-center p-4 min-h-screen pt-20 md:pt-4">
        <Card className="w-full min-h-[600px] h-auto md:h-[600px] bg-black/[0.96] relative overflow-hidden border-neutral-800 flex flex-col">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />

          <div className="flex h-full flex-col md:flex-row relative flex-1">
            {/* Left content */}
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                Experience the World with Thrive
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg mb-8 mx-auto md:mx-0">
                Your gateway to seamless travel experiences. From flight bookings to custom itineraries, we handle the details so you can focus on the journey.
              </p>
            </div>

            {/* Center Buttons (Responsive: Row on Mobile, Col on Desktop, Absolute on Desktop) */}
            <div className="relative md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-30 flex flex-row md:flex-col gap-4 justify-center items-center py-6 md:py-0 w-full md:w-auto bg-black/50 md:bg-transparent backdrop-blur-sm md:backdrop-filter-none">
              <Button
                variant="outline"
                className={cn(
                  "rounded-full h-12 border-neutral-700 bg-black/50 hover:bg-neutral-800 hover:text-white transition-all duration-300 px-6 gap-2 min-w-[140px] md:min-w-[160px]",
                  activeForm === 'book' && "bg-white text-black border-white hover:bg-neutral-200"
                )}
                onClick={() => toggleForm('book')}
              >
                <Plane className="h-5 w-5" />
                <span className="font-medium">Book Flight</span>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "rounded-full h-12 border-neutral-700 bg-black/50 hover:bg-neutral-800 hover:text-white transition-all duration-300 px-6 gap-2 min-w-[140px] md:min-w-[160px]",
                  activeForm === 'quote' && "bg-white text-black border-white hover:bg-neutral-200"
                )}
                onClick={() => toggleForm('quote')}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Get a Quote</span>
              </Button>
            </div>

            {/* Right content (3D Scene + Forms) */}
            <div className="flex-1 relative min-h-[400px] md:min-h-full overflow-hidden w-full">
              {/* 3D Scene */}
              <div className="w-full h-full relative z-0">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>

              {/* Form Overlays - Positioned to look "held" */}
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-40 w-full flex justify-center px-4",
                activeForm === 'book' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}>
                <BookFlightForm className="relative mt-20 md:mt-0" />
              </div>

              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-40 w-full flex justify-center px-4",
                activeForm === 'quote' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}>
                <CustomQuoteForm className="relative mt-20 md:mt-0" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Services Section */}
      <ServicesMarquee
        title="Our Premium Services"
        description="Comprehensive travel solutions tailored to your unique needs."
        services={services}
        className="bg-black text-white py-12"
      />

      {/* Featured Tours Section */}
      <FeaturedTours />

      {/* Pricing Section */}
      <PricingSection />

      {/* About Us Section */}
      <AboutUsSection />

      {/* Footer Section */}
      <FooterSection />
    </div>
  )
}

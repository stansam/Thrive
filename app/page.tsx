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

export default function SplineSceneBasic() {
  const [activeForm, setActiveForm] = useState<'none' | 'book' | 'quote'>('none')

  const toggleForm = (form: 'book' | 'quote') => {
    setActiveForm(curr => curr === form ? 'none' : form)
  }

  return (
    <div className="min-h-screen bg-black dark font-sans">
      {/* Hero Section */}
      <section className="flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden border-neutral-800">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />

          <div className="flex h-full flex-col md:flex-row relative">
            {/* Left content */}
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                Interactive 3D
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg mb-8">
                Bring your UI to life with beautiful 3D scenes. Create immersive experiences
                that capture attention and enhance your design.
              </p>
            </div>

            {/* Center Buttons (Vertical) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12 border-neutral-700 bg-black/50 hover:bg-neutral-800 hover:text-white transition-all duration-300",
                  activeForm === 'book' && "bg-white text-black border-white hover:bg-neutral-200"
                )}
                onClick={() => toggleForm('book')}
              >
                <Plane className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12 border-neutral-700 bg-black/50 hover:bg-neutral-800 hover:text-white transition-all duration-300",
                  activeForm === 'quote' && "bg-white text-black border-white hover:bg-neutral-200"
                )}
                onClick={() => toggleForm('quote')}
              >
                <FileText className="h-5 w-5" />
              </Button>
            </div>

            {/* Right content (3D Scene + Forms) */}
            <div className="flex-1 relative min-h-[300px] md:min-h-full overflow-hidden">
              {/* 3D Scene */}
              <div className="w-full h-full relative z-0">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>

              {/* Form Overlays - Positioned to look "held" */}
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-20",
                activeForm === 'book' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}>
                <BookFlightForm className="relative mt-20" />
              </div>

              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-20",
                activeForm === 'quote' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}>
                <CustomQuoteForm className="relative mt-20" />
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

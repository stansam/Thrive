import { PricingCard } from "@/components/ui/pricing-card";

export function PricingSection() {
    return (
        <section className="py-24 px-4 bg-black text-white" id="pricing">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mx-auto flex max-w-3xl flex-col text-center mb-16">
                    <h2 className="mb-4 text-3xl font-semibold md:text-5xl">
                        Transparent Pricing
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Choose the perfect plan for your travel needs. Whether you're an individual, a group, or a corporation, we have you covered.
                    </p>
                </div>

                {/* Corporate Monthly Packages */}
                <div className="mb-20">
                    <h3 className="text-2xl font-semibold mb-8 text-center text-white">Corporate Monthly Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PricingCard
                            title="Bronze"
                            price="$150 / mo"
                            description="Essential for small teams."
                            buttonVariant="outline"
                            features={[
                                "Up to 6 bookings per month",
                                "Standard support",
                                "Monthly reporting"
                            ]}
                        />

                        <PricingCard
                            title="Silver"
                            price="$300 / mo"
                            description="Perfect for growing businesses."
                            buttonVariant="outline"
                            features={[
                                "Up to 15 bookings per month",
                                "Priority support",
                                "Dedicated account manager",
                                "Expense integration"
                            ]}
                        />

                        <PricingCard
                            title="Gold"
                            price="$500 / mo"
                            description="Ultimate solution for large enterprises."
                            buttonVariant="default"
                            highlight
                            features={[
                                "Unlimited bookings",
                                "24/7 Concierge Support",
                                "Custom travel policies",
                                "VIP Lounge Access coordination",
                                "Quarterly business reviews"
                            ]}
                        />
                    </div>
                </div>

                {/* Fee Structures Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ticket Fees */}
                    <PricingCard
                        title="Ticket Booking Fees"
                        price="Pay as you go"
                        description="Standard service fees per transaction."
                        buttonVariant="outline"
                        features={[
                            "Domestic Flights: $25–$50 per ticket",
                            "International Flights: $50–$100 per ticket",
                            "Last-Minute Emergency Booking: +$25",
                            "Group Bookings: $15 per traveler (min 5)"
                        ]}
                    />

                    {/* Additional Revenue Streams */}
                    <PricingCard
                        title="Additional Services"
                        price="Add-ons"
                        description="Enhance your trip with customized extras."
                        buttonVariant="outline"
                        features={[
                            "Hotel booking fee: $20 per booking",
                            "Car rental booking fee: $15",
                            "Customized itineraries: $50–$150",
                            "Travel insurance commissions",
                            "Passport/visa information consulting"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}

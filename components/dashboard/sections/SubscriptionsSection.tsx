"use client"

/**
 * Subscriptions Section Component  
 * Subscription management and upgrade with Stripe integration
 */

import { useState } from 'react';
import { useSubscriptions, useUpgradeSubscription } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Crown, Zap, Star, Loader2, Info } from 'lucide-react';
import StripePaymentModal from '../StripePaymentModal';

interface SubscriptionPlan {
    tier: 'bronze' | 'silver' | 'gold';
    name: string;
    price: number;
    icon: React.ComponentType<{ className?: string }>;
    popular?: boolean;
    features: string[];
    maxBookings: number | string;
}

const plans: SubscriptionPlan[] = [
    {
        tier: 'bronze',
        name: 'Bronze',
        price: 29.99,
        icon: Star,
        maxBookings: 6,
        features: [
            '6 bookings per month',
            '5% discount on all bookings',
            'Email support',
            'Basic travel insurance',
        ],
    },
    {
        tier: 'silver',
        name: 'Silver',
        price: 59.99,
        icon: Zap,
        popular: true,
        maxBookings: 15,
        features: [
            '15 bookings per month',
            '10% discount on all bookings',
            'Priority support',
            'Free cancellation',
            'Premium travel insurance',
            'Airport lounge access',
        ],
    },
    {
        tier: 'gold',
        name: 'Gold',
        price: 99.99,
        icon: Crown,
        maxBookings: 'Unlimited',
        features: [
            'Unlimited bookings',
            '15% discount on all bookings',
            '24/7 VIP support',
            'Free cancellation',
            'Premium travel insurance',
            'Airport lounge access',
            'Concierge service',
            'Exclusive deals',
        ],
    },
];

export default function SubscriptionsSection() {
    const { subscriptions, isLoading, isError } = useSubscriptions();
    const { upgradeSubscription, isUpgrading } = useUpgradeSubscription();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [upgradeError, setUpgradeError] = useState('');

    const currentTier = subscriptions?.currentSubscription?.tier || 'none';
    const bookingsUsed = subscriptions?.currentSubscription?.bookingsUsed || 0;
    // Calculate max bookings from plan definition just to be safe or use what's returned if available
    // The API returns bookingsRemaining, but total limit isn't explicitly in 'currentSubscription' object usually, 
    // but we can infer or map it.
    const currentPlanDef = plans.find(p => p.tier === currentTier);
    const maxBookings = currentPlanDef?.maxBookings || 0;
    const isUnlimited = maxBookings === 'Unlimited';

    // Calculate percentage
    const usagePercentage = isUnlimited ? 0 : Math.min(100, (bookingsUsed / (typeof maxBookings === 'number' ? maxBookings : 1)) * 100);

    const handleUpgrade = async (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setUpgradeError('');

        try {
            // Call backend to create payment intent
            const response = await upgradeSubscription({
                tier: plan.tier,
            });

            if (response.clientSecret) {
                setClientSecret(response.clientSecret);
                setPaymentModalOpen(true);
            }
        } catch (error: any) {
            setUpgradeError(error?.message || 'Failed to initiate upgrade. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setPaymentModalOpen(false);
        setSelectedPlan(null);
        setClientSecret('');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-8 w-32 mt-2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map((j) => (
                                                <Skeleton key={j} className="h-4 w-full" />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load subscription information. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
                    <p className="text-muted-foreground">Manage your plan, check your usage, and upgrade for more benefits.</p>
                </div>

                {/* Current Subscription Overview */}
                {currentTier !== 'none' && (
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Active Plan Details</CardTitle>
                                    <CardDescription>
                                        Renews on {subscriptions?.currentSubscription?.endDate ? new Date(subscriptions.currentSubscription.endDate).toLocaleDateString() : 'N/A'}
                                    </CardDescription>
                                </div>
                                <Badge variant="default" className="capitalize px-3 py-1 text-sm">
                                    {currentTier} Active
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Plan Info */}
                                <div className="flex flex-1 items-start gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                                        {currentTier === 'bronze' && <Star className="h-8 w-8 text-primary" />}
                                        {currentTier === 'silver' && <Zap className="h-8 w-8 text-primary" />}
                                        {currentTier === 'gold' && <Crown className="h-8 w-8 text-primary" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-xl capitalize">{currentTier} Plan Benefits</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                            {currentPlanDef?.features.slice(0, 4).map((f, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Usage Stats */}
                                <div className="flex-1 space-y-3 min-w-[250px]">
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <span>Monthly Bookings Usage</span>
                                        <span className={usagePercentage > 80 ? "text-destructive" : "text-primary"}>
                                            {bookingsUsed} / {maxBookings}
                                        </span>
                                    </div>
                                    {!isUnlimited && (
                                        <Progress value={usagePercentage} className="h-2" indicatorClassName={usagePercentage > 90 ? 'bg-destructive' : ''} />
                                    )}
                                    {isUnlimited && (
                                        <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                                            <div className="h-full w-full bg-primary animate-pulse" />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground text-right">
                                        {isUnlimited ? 'You have unlimited access!' : `${(maxBookings as number) - bookingsUsed} bookings remaining`}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 flex justify-end gap-2 py-3 px-6 rounded-b-lg">
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                Cancel Subscription
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Error Message */}
                {upgradeError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{upgradeError}</AlertDescription>
                    </Alert>
                )}

                {/* Subscription Plans Comparison */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Available Plans</h3>
                    <div className="grid gap-6 md:grid-cols-3">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrentPlan = currentTier === plan.tier;
                            const canUpgrade = currentTier === 'none' ||
                                (currentTier === 'bronze' && plan.tier !== 'bronze') ||
                                (currentTier === 'silver' && plan.tier === 'gold');

                            return (
                                <Card
                                    key={plan.tier}
                                    className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-border shadow-sm'}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                            Most Popular
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            {isCurrentPlan && (
                                                <Badge variant="outline" className="border-primary text-primary">Current</Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                        <div className="mt-2 flex items-baseline gap-1">
                                            <span className="text-4xl font-bold">${plan.price}</span>
                                            <span className="text-sm font-medium text-muted-foreground">/month</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Perfect for {plan.tier === 'bronze' ? 'casual travelers' : plan.tier === 'silver' ? 'frequent flyers' : 'luxury explorers'}.
                                        </p>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter className="pt-4">
                                        <Tooltip>
                                            <TooltipTrigger asChild max-w-full w-full>
                                                <div className="w-full">
                                                    <Button
                                                        className="w-full"
                                                        variant={plan.popular ? 'default' : 'outline'}
                                                        disabled={isCurrentPlan || isUpgrading}
                                                        onClick={() => canUpgrade ? handleUpgrade(plan) : null}
                                                    >
                                                        {isUpgrading && selectedPlan?.tier === plan.tier ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : isCurrentPlan ? (
                                                            'Current Plan'
                                                        ) : (
                                                            canUpgrade ? `Upgrade to ${plan.name}` : 'Contact Support to Downgrade'
                                                        )}
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {!canUpgrade && !isCurrentPlan && (
                                                <TooltipContent>
                                                    <p>To downgrade your plan, please contact our support team.</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Modal */}
                {selectedPlan && clientSecret && (
                    <StripePaymentModal
                        isOpen={paymentModalOpen}
                        onClose={handleCloseModal}
                        tier={selectedPlan.tier}
                        amount={selectedPlan.price}
                        clientSecret={clientSecret}
                    />
                )}
            </div>
        </TooltipProvider>
    );
}

"use client"

/**
 * Subscriptions Section Component  
 * Subscription management and upgrade with Stripe integration
 */

import { useState } from 'react';
import { useSubscriptions, useUpgradeSubscription } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Crown, Zap, Star, Loader2 } from 'lucide-react';
import StripePaymentModal from '../StripePaymentModal';

interface SubscriptionPlan {
    tier: 'bronze' | 'silver' | 'gold';
    name: string;
    price: number;
    icon: React.ComponentType<{ className?: string }>;
    popular?: boolean;
    features: string[];
}

const plans: SubscriptionPlan[] = [
    {
        tier: 'bronze',
        name: 'Bronze',
        price: 29.99,
        icon: Star,
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
        <div className="space-y-6">
            {/* Current Subscription Status */}
            {currentTier !== 'none' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Current Subscription</CardTitle>
                        <CardDescription>Your active plan and benefits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    {currentTier === 'bronze' && <Star className="h-6 w-6 text-primary" />}
                                    {currentTier === 'silver' && <Zap className="h-6 w-6 text-primary" />}
                                    {currentTier === 'gold' && <Crown className="h-6 w-6 text-primary" />}
                                </div>
                                <div>
                                    <p className="font-semibold capitalize">{currentTier} Plan</p>
                                    <p className="text-sm text-muted-foreground">
                                        {subscriptions?.currentSubscription?.bookingsUsed || 0} of{' '}
                                        {subscriptions?.currentSubscription?.bookingsRemaining || 0} bookings used this month
                                    </p>
                                </div>
                            </div>
                            <Badge variant="default" className="capitalize">
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Message */}
            {upgradeError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{upgradeError}</AlertDescription>
                </Alert>
            )}

            {/* Subscription Plans */}
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>Choose the plan that fits your travel needs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrentPlan = currentTier === plan.tier;
                            const canUpgrade = currentTier === 'none' ||
                                (currentTier === 'bronze' && plan.tier !== 'bronze') ||
                                (currentTier === 'silver' && plan.tier === 'gold');

                            return (
                                <Card
                                    key={plan.tier}
                                    className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge>Most Popular</Badge>
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-primary" />
                                                <CardTitle>{plan.name}</CardTitle>
                                            </div>
                                            {isCurrentPlan && (
                                                <Badge variant="outline">Current</Badge>
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold">
                                            ${plan.price}
                                            <span className="text-sm font-normal text-muted-foreground">/month</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            className="w-full"
                                            variant={plan.popular ? 'default' : 'outline'}
                                            disabled={isCurrentPlan || !canUpgrade || isUpgrading}
                                            onClick={() => handleUpgrade(plan)}
                                        >
                                            {isUpgrading && selectedPlan?.tier === plan.tier ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : isCurrentPlan ? (
                                                'Current Plan'
                                            ) : !canUpgrade ? (
                                                'Not Available'
                                            ) : (
                                                `Upgrade to ${plan.name}`
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

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
    );
}

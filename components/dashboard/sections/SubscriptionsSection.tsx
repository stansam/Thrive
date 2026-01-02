"use client"

/**
 * Subscriptions Section Component  
 * Subscription management and upgrade with Stripe
 * TODO: Implement full Stripe payment integration
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function SubscriptionsSection() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>Choose the plan that fits your travel needs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Bronze Plan */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Bronze</CardTitle>
                                <div className="text-3xl font-bold">$29.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">6 bookings per month</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">5% discount</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Email support</span>
                                    </li>
                                </ul>
                                <Button className="w-full">Upgrade to Bronze</Button>
                            </CardContent>
                        </Card>

                        {/* Silver Plan */}
                        <Card className="border-primary">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Silver</CardTitle>
                                    <Badge>Popular</Badge>
                                </div>
                                <div className="text-3xl font-bold">$59.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">15 bookings per month</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">10% discount</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Priority support</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Free cancellation</span>
                                    </li>
                                </ul>
                                <Button className="w-full">Upgrade to Silver</Button>
                            </CardContent>
                        </Card>

                        {/* Gold Plan */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gold</CardTitle>
                                <div className="text-3xl font-bold">$99.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Unlimited bookings</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">15% discount</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">24/7 support</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Free cancellation</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Concierge service</span>
                                    </li>
                                </ul>
                                <Button className="w-full">Upgrade to Gold</Button>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

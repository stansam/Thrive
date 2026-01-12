
"use client"

import { useState } from 'react';
import { useMyPackages } from '@/lib/hooks/use-packages-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package as PackageIcon, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PackageDetailsView from '../views/PackageDetailsView';

export default function MyPackagesTab() {
    const { booked, saved, isLoading } = useMyPackages();
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    if (selectedBookingId) {
        return <PackageDetailsView bookingId={selectedBookingId} onBack={() => setSelectedBookingId(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">My Packages</h2>
                <p className="text-muted-foreground">View and manage your booked and saved packages.</p>
            </div>

            <Tabs defaultValue="booked" className="w-full">
                <TabsList>
                    <TabsTrigger value="booked">Booked Packages</TabsTrigger>
                    <TabsTrigger value="saved">Saved & Wishlist</TabsTrigger>
                </TabsList>

                <TabsContent value="booked" className="mt-6 space-y-4">
                    {isLoading ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)
                    ) : booked.length > 0 ? (
                        booked.map((pkg: any) => (
                            <Card key={pkg.id}>
                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-48 h-48 md:h-auto relative">
                                        <img
                                            src={pkg.image || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&file=jpg"}
                                            alt={pkg.package_title}
                                            className="w-full h-full object-cover md:rounded-l-xl rounded-t-xl md:rounded-tr-none"
                                        />
                                    </div>
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-xl">{pkg.package_title}</h3>
                                                <Badge className="mt-2" variant={pkg.status === 'confirmed' ? 'default' : 'secondary'}>{pkg.status}</Badge>
                                            </div>
                                            <Button variant="outline" onClick={() => setSelectedBookingId(pkg.id)}>Manage Booking</Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(pkg.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <PackageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No booked packages</h3>
                            <p className="text-muted-foreground mb-4">You haven't booked any packages yet.</p>
                            <Button>Explore Packages</Button>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="saved" className="mt-6">
                    {/* Similar structure for saved items */}
                    <Card className="p-12 text-center">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <PackageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No saved packages</h3>
                        <p className="text-muted-foreground mb-4">Packages you save will appear here.</p>
                        <Button>Explore Packages</Button>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

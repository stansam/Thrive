
"use client"

import { useState } from 'react';
import { useExplorePackages } from '@/lib/hooks/use-packages-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package as PackageIcon, Search, MapPin, DollarSign, Calendar } from 'lucide-react';

export default function ExplorePackagesTab() {
    const [search, setSearch] = useState('');
    const { featured, packages, isLoading } = useExplorePackages({ search });

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Explore Packages</h2>
                <p className="text-muted-foreground">Discover curated travel experiences and getaways.</p>
            </div>

            {/* Featured Slider (Simplified as grid for now) */}
            {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-2xl" />
            ) : featured.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden h-[300px] bg-black group">
                    <img
                        src={featured[0].image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"}
                        alt="Featured"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
                        <Badge className="w-fit mb-2 bg-primary text-primary-foreground">Featured Destination</Badge>
                        <h3 className="text-3xl font-bold text-white mb-2">{featured[0].title}</h3>
                        <p className="text-white/80 max-w-xl mb-4">{featured[0].duration}</p>
                        <Button size="lg" className="w-fit">View Package</Button>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search destinations (e.g., 'Bali', 'Swiss Alps')"
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline">Filters</Button>
            </div>

            {/* Package Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-[350px] rounded-xl" />)
                ) : packages.length > 0 ? (
                    packages.map((pkg: any) => (
                        <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-card">
                            <div className="h-48 relative">
                                <img
                                    src={pkg.image || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&file=jpg"}
                                    alt={pkg.title}
                                    className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white border-none">
                                    {pkg.travel_type || 'Leisure'}
                                </Badge>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg line-clamp-1">{pkg.title}</h3>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mb-4 gap-4">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {pkg.destination}</span>
                                    {pkg.duration && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {pkg.duration}</span>}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Starting from</span>
                                        <span className="text-xl font-bold">${pkg.price}</span>
                                    </div>
                                    <Button variant="outline" size="sm">Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <PackageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No packages found</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

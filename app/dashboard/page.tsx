"use client"

/**
 * Main Dashboard Page
 * Orchestrates tab navigation and renders appropriate content
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SWRConfig } from 'swr';
import DashboardLayout, { type DashboardTab } from '@/components/dashboard/DashboardLayout';
import DashboardTabComponent from '@/components/dashboard/tabs/DashboardTab';
import FlightsTab from '@/components/dashboard/tabs/FlightsTab';
import MyPackagesTab from '@/components/dashboard/tabs/MyPackagesTab';
import ExplorePackagesTab from '@/components/dashboard/tabs/ExplorePackagesTab';
import ContactTab from '@/components/dashboard/tabs/ContactTab';
import ProfileSection from '@/components/dashboard/sections/ProfileSection';
import SubscriptionsSection from '@/components/dashboard/sections/SubscriptionsSection';
import SettingsSection from '@/components/dashboard/sections/SettingsSection';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/sign-in');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Will redirect via useEffect

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardTabComponent />;
            case 'flights':
                return <FlightsTab />;
            case 'my-packages':
                return <MyPackagesTab changeTab={setActiveTab} />;
            case 'explore-packages':
                return <ExplorePackagesTab />;
            case 'contact':
                return <ContactTab />;
            case 'profile':
                return <ProfileSection />;
            case 'subscriptions':
                return <SubscriptionsSection />;
            case 'settings':
                return <SettingsSection />;
            default:
                return <DashboardTabComponent />;
        }
    };

    return (
        <SWRConfig
            value={{
                refreshInterval: 0,
                revalidateOnFocus: false,
                shouldRetryOnError: false,
            }}
        >
            <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
                {renderTabContent()}
            </DashboardLayout>
        </SWRConfig>
    );
}

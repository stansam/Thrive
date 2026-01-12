"use client"

/**
 * Main Dashboard Page
 * Orchestrates tab navigation and renders appropriate content
 */

import { useState } from 'react';
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

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardTabComponent />;
            case 'flights':
                return <FlightsTab />;
            case 'my-packages':
                return <MyPackagesTab />;
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

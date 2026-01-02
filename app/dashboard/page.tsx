"use client"

/**
 * Main Dashboard Page
 * Orchestrates tab navigation and renders appropriate content
 */

import { useState } from 'react';
import { SWRConfig } from 'swr';
import DashboardLayout, { type DashboardTab } from '@/components/dashboard/DashboardLayout';
import DashboardTabComponent from '@/components/dashboard/tabs/DashboardTab';
import MyBookingsTab from '@/components/dashboard/tabs/MyBookingsTab';
import MyTripsTab from '@/components/dashboard/tabs/MyTripsTab';
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
            case 'bookings':
                return <MyBookingsTab />;
            case 'trips':
                return <MyTripsTab />;
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

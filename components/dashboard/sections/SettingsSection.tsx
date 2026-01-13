"use client"

/**
 * Settings Section Component
 * User preferences and account settings
 */

import { useState } from 'react';
import { useSettings } from '@/lib/hooks/use-dashboard-api';
import { SettingsUpdateData } from '@/lib/types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SettingsSection() {
    const { settings, isLoading, isError, error, updateSettings } = useSettings();
    const [updatingField, setUpdatingField] = useState<string | null>(null);

    const handleToggle = async (field: keyof SettingsUpdateData, value: boolean) => {
        setUpdatingField(field);
        try {
            await updateSettings({ [field]: value });
        } catch (err) {
            console.error('Failed to update setting', err);
        } finally {
            setUpdatingField(null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2].map((j) => (
                                <div key={j} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <Skeleton className="h-6 w-10" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load settings. {error?.message || 'Please try again later.'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive booking updates via email</p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={settings?.emailNotifications}
                            onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
                            disabled={updatingField === 'emailNotifications'}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="marketing-emails">Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">Receive promotional offers and deals</p>
                        </div>
                        <Switch
                            id="marketing-emails"
                            checked={settings?.marketingEmails}
                            onCheckedChange={(checked) => handleToggle('marketingEmails', checked)}
                            disabled={updatingField === 'marketingEmails'}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get text alerts for bookings</p>
                        </div>
                        <Switch
                            id="sms-notifications"
                            checked={settings?.smsNotifications}
                            onCheckedChange={(checked) => handleToggle('smsNotifications', checked)}
                            disabled={updatingField === 'smsNotifications'}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your data and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="profile-visibility">Profile Visibility</Label>
                            <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                        </div>
                        <Switch
                            id="profile-visibility"
                            checked={settings?.profileVisibility}
                            onCheckedChange={(checked) => handleToggle('profileVisibility', checked)}
                            disabled={updatingField === 'profileVisibility'}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="data-sharing">Data Sharing</Label>
                            <p className="text-sm text-muted-foreground">Share data with partners for better recommendations</p>
                        </div>
                        <Switch
                            id="data-sharing"
                            checked={settings?.dataSharing}
                            onCheckedChange={(checked) => handleToggle('dataSharing', checked)}
                            disabled={updatingField === 'dataSharing'}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">Change Password</Button>
                    <Button variant="outline" className="w-full">Download My Data</Button>
                    <Button variant="destructive" className="w-full">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    );
}

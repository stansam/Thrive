"use client"

/**
 * Profile Section Component
 * User profile viewing and editing
 */

import { useState } from 'react';
import { useProfile } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function ProfileSection() {
    const { profile, isLoading, isError, error, updateProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        nationality: '',
        dateOfBirth: '',
        passportNumber: '',
        passportExpiry: '',
        preferredAirline: '',
        dietaryPreferences: '',
        specialAssistance: '',
        billingAddress: '',
    });

    // Initialize form data when profile loads
    if (profile && !isEditing && formData.firstName === '') {
        setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phone: profile.phone || '',
            nationality: profile.nationality || '',
            dateOfBirth: profile.dateOfBirth || '',
            passportNumber: profile.passportNumber || '',
            passportExpiry: profile.passportExpiry || '',
            preferredAirline: profile.preferredAirline || '',
            dietaryPreferences: profile.dietaryPreferences || '',
            specialAssistance: profile.specialAssistance || '',
            billingAddress: profile.billingAddress || '',
        });
    }

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');

        try {
            await updateProfile(formData);
            setSaveStatus('success');
            setIsEditing(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err: any) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSaveStatus('idle');
        if (profile) {
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone || '',
                nationality: profile.nationality || '',
                dateOfBirth: profile.dateOfBirth || '',
                passportNumber: profile.passportNumber || '',
                passportExpiry: profile.passportExpiry || '',
                preferredAirline: profile.preferredAirline || '',
                dietaryPreferences: profile.dietaryPreferences || '',
                specialAssistance: profile.specialAssistance || '',
                billingAddress: profile.billingAddress || '',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
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
                    Failed to load profile. {error?.message || 'Please try again later.'}
                </AlertDescription>
            </Alert>
        );
    }

    const userInitials = profile
        ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
        : 'U';

    return (
        <div className="space-y-6">
            {saveStatus === 'success' && (
                <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                        Profile updated successfully!
                    </AlertDescription>
                </Alert>
            )}

            {saveStatus === 'error' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to update profile. Please try again.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Manage your account details</CardDescription>
                        </div>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${profile.firstName} ${profile.lastName}` : undefined} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{profile?.firstName} {profile?.lastName}</p>
                            <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                                id="nationality"
                                value={formData.nationality}
                                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{profile?.email}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Subscription</Label>
                            <p className="font-medium capitalize">{profile?.subscriptionTier || 'None'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Referral Code</Label>
                            <p className="font-medium">{profile?.referralCode}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Referral Credits</Label>
                            <p className="font-medium">${profile?.referralCredits?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

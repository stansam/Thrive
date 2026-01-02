"use client"

/**
 * Contact Us Tab Component
 * Support form for user inquiries and assistance
 */

import { useState } from 'react';
import { useContactForm } from '@/lib/hooks/use-dashboard-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactTab() {
    const [formData, setFormData] = useState({
        category: 'general',
        subject: '',
        message: '',
        bookingReference: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const { submitContact } = useContactForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.message.trim()) {
            setSubmitStatus('error');
            setErrorMessage('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await submitContact({
                category: formData.category as any,
                subject: formData.subject,
                message: formData.message,
                bookingReference: formData.bookingReference || undefined,
            });

            setSubmitStatus('success');
            setFormData({
                category: 'general',
                subject: '',
                message: '',
                bookingReference: '',
            });

            // Reset success message after 5 seconds
            setTimeout(() => setSubmitStatus('idle'), 5000);
        } catch (error: any) {
            setSubmitStatus('error');
            setErrorMessage(error?.message || 'Failed to submit message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (submitStatus === 'error') {
            setSubmitStatus('idle');
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact Form */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>
                        We'll get back to you within 24 hours
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submitStatus === 'success' && (
                        <Alert className="mb-6 border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-600">
                                Your message has been sent successfully! We'll get back to you soon.
                            </AlertDescription>
                        </Alert>
                    )}

                    {submitStatus === 'error' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleChange('category', value)}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General Inquiry</SelectItem>
                                    <SelectItem value="booking">Booking Assistance</SelectItem>
                                    <SelectItem value="payment">Payment Issue</SelectItem>
                                    <SelectItem value="technical">Technical Support</SelectItem>
                                    <SelectItem value="feedback">Feedback</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Booking Reference (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="bookingReference">
                                Booking Reference (Optional)
                            </Label>
                            <Input
                                id="bookingReference"
                                placeholder="e.g., TGT-ABC123"
                                value={formData.bookingReference}
                                onChange={(e) => handleChange('bookingReference', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Include if your inquiry is about a specific booking
                            </p>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                Subject <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="subject"
                                placeholder="Brief description of your inquiry"
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                                required
                                minLength={5}
                                maxLength={200}
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">
                                Message <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Please provide as much detail as possible..."
                                value={formData.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                required
                                minLength={20}
                                maxLength={2000}
                                rows={8}
                            />
                            <p className="text-xs text-muted-foreground">
                                {formData.message.length}/2000 characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Other ways to reach us</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">support@thrivetravel.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                                <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9AM-6PM EST</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Office</p>
                                <p className="text-sm text-muted-foreground">
                                    123 Travel Street<br />
                                    New York, NY 10001<br />
                                    United States
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>FAQ</CardTitle>
                        <CardDescription>Quick answers to common questions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium text-sm">How do I cancel a booking?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Go to My Bookings, select your booking, and click Cancel. Refunds depend on our cancellation policy.
                            </p>
                        </div>

                        <div>
                            <p className="font-medium text-sm">When will I receive my booking confirmation?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You'll receive an email confirmation within 15 minutes of booking. Check your spam folder if you don't see it.
                            </p>
                        </div>

                        <div>
                            <p className="font-medium text-sm">How do I upgrade my subscription?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Visit the Subscriptions section in your dashboard to view and upgrade your plan.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

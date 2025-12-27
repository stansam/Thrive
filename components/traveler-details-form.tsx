"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, FileText, Mail, Phone } from "lucide-react"

export interface TravelerData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    passportNumber: string;
    passportExpiry: string;
    nationality: string;
}

interface TravelerDetailsFormProps {
    id?: string;
    travelerType?: "Adult" | "Child" | "Infant";
    onChange: (data: TravelerData) => void;
    errors?: Partial<Record<keyof TravelerData, string>>;
}

export function TravelerDetailsForm({ id = "1", travelerType = "Adult", onChange, errors = {} }: TravelerDetailsFormProps) {
    const [formData, setFormData] = React.useState<TravelerData>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        phone: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: "",
    });

    const handleChange = (field: keyof TravelerData, value: string) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
    };

    return (
        <Card className="bg-neutral-900/50 border-neutral-800 text-white">
            <CardHeader className="border-b border-neutral-800 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    Traveler {id} ({travelerType})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

                {/* Personal Details */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-neutral-300">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`firstName-${id}`}>First Name</Label>
                            <Input
                                id={`firstName-${id}`}
                                placeholder="e.g. John"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                            />
                            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`lastName-${id}`}>Last Name</Label>
                            <Input
                                id={`lastName-${id}`}
                                placeholder="e.g. Doe"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                            />
                            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`dob-${id}`}>Date of Birth</Label>
                            <Input
                                id={`dob-${id}`}
                                type="date"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                            />
                            {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`gender-${id}`}>Gender</Label>
                            <Select onValueChange={(val) => handleChange("gender", val)}>
                                <SelectTrigger id={`gender-${id}`} className="bg-neutral-950 border-neutral-800">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="UNDISCLOSED">Undisclosed</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                        </div>
                    </div>
                </div>

                {/* Contact Details (Only for first adult usually, but included here generic) */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`email-${id}`}>Email Address</Label>
                            <Input
                                id={`email-${id}`}
                                type="email"
                                placeholder="john.doe@example.com"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`phone-${id}`}>Phone Number</Label>
                            <Input
                                id={`phone-${id}`}
                                type="tel"
                                placeholder="+1 234 567 8900"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                            />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Travel Documents */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Travel Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`nationality-${id}`}>Nationality</Label>
                            <Input
                                id={`nationality-${id}`}
                                placeholder="e.g. US"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.nationality}
                                onChange={(e) => handleChange("nationality", e.target.value)}
                            />
                            {errors.nationality && <p className="text-xs text-red-500">{errors.nationality}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`passport-${id}`}>Passport Number</Label>
                            <Input
                                id={`passport-${id}`}
                                placeholder="e.g. A1234567"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.passportNumber}
                                onChange={(e) => handleChange("passportNumber", e.target.value)}
                            />
                            {errors.passportNumber && <p className="text-xs text-red-500">{errors.passportNumber}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`expiry-${id}`}>Expiry Date</Label>
                            <Input
                                id={`expiry-${id}`}
                                type="date"
                                className="bg-neutral-950 border-neutral-800"
                                value={formData.passportExpiry}
                                onChange={(e) => handleChange("passportExpiry", e.target.value)}
                            />
                            {errors.passportExpiry && <p className="text-xs text-red-500">{errors.passportExpiry}</p>}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}

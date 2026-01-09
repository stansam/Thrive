'use client';

import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { parse as parseMrz } from 'mrz';
import { Loader2, Camera, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ScannedPassportData {
    firstName: string;
    lastName: string;
    passportNumber: string;
    nationality: string;
    birthDate: string; // YYYY-MM-DD
    expirationDate: string; // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE' | '';
}

interface PassportScannerProps {
    onScanComplete: (data: ScannedPassportData) => void;
    onError?: (error: string) => void;
}

export function PassportScanner({ onScanComplete, onError }: PassportScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format date from YYMMDD to YYYY-MM-DD
    const formatMrzDate = (dateStr: string, isExpiry: boolean = false): string => {
        if (!dateStr || dateStr.length !== 6) return '';

        const yearStats = parseInt(dateStr.substring(0, 2));
        const month = dateStr.substring(2, 4);
        const day = dateStr.substring(4, 6);

        let fullYear = '';

        if (yearStats < 50) {
            fullYear = `20${yearStats.toString().padStart(2, '0')}`;
        } else {
            fullYear = `19${yearStats.toString().padStart(2, '0')}`;
        }

        return `${fullYear}-${month}-${day}`;
    };

    const processImage = async (imageFile: File) => {
        setIsScanning(true);
        setError(null);
        setStatus('Initializing OCR engine...');

        try {
            const worker = await createWorker('eng');

            await worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
            });

            setStatus('Scanning image...');
            const ret = await worker.recognize(imageFile);

            setStatus('Parsing data...');
            const text = ret.data.text;

            await worker.terminate();

            const lines = text.split('\n')
                .map(l => l.replace(/ /g, '').trim())
                .filter(l => l.length > 20 && l.includes('<<'));

            if (lines.length < 2) {
                throw new Error("Could not detect MRZ zone. Please ensure image is clear and contains the bottom part of the passport.");
            }

            const mrzLines = lines.slice(-2);

            try {
                const parsed = parseMrz(mrzLines);

                // Map to our format
                const genderMap: Record<string, 'MALE' | 'FEMALE'> = { 'male': 'MALE', 'female': 'FEMALE' };
                const sex = parsed.fields.sex ? parsed.fields.sex.toLowerCase() : '';

                const data: ScannedPassportData = {
                    firstName: parsed.fields.firstName || '',
                    lastName: parsed.fields.lastName || '',
                    passportNumber: parsed.fields.documentNumber || '',
                    nationality: parsed.fields.nationality || '',
                    birthDate: formatMrzDate(parsed.fields.birthDate || ''),
                    expirationDate: formatMrzDate(parsed.fields.expirationDate || '', true),
                    gender: (genderMap[sex] as 'MALE' | 'FEMALE') || ''
                };

                if (!data.passportNumber || !data.lastName) {
                    throw new Error("Extracted data is incomplete. Please try again or enter manually.");
                }

                onScanComplete(data);
                setIsScanning(false);

            } catch (parseError) {
                console.error("MRZ Parse Error", parseError);
                throw new Error("Failed to parse passport data. Please ensure the image is clear and well-lit.");
            }

        } catch (err: any) {
            console.error(err);
            const msg = err.message || "OCR failed";
            setError(msg);
            if (onError) onError(msg);
            setIsScanning(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    return (
        <Card className="w-full bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-sky-400" />
                    Passport Scanner
                </CardTitle>
                <CardDescription>
                    Auto-fill details by scanning the photo page of your passport.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Scan Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!isScanning && (
                    <div
                        className="border-2 border-dashed border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-sky-500/50 hover:bg-neutral-800/50 transition-all text-center group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="bg-neutral-800 p-4 rounded-full mb-4 group-hover:bg-sky-500/10 transition-colors">
                            <Upload className="h-6 w-6 text-neutral-400 group-hover:text-sky-400" />
                        </div>
                        <h3 className="font-medium text-white mb-1">Click to Upload or Capture</h3>
                        <p className="text-xs text-neutral-400 max-w-[200px]">
                            Ensure the bottom two lines (MRZ Code) are clearly visible and well-lit.
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {isScanning && (
                    <div className="py-8 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
                        <div className="space-y-1 text-center">
                            <p className="font-medium text-white">{status}</p>
                            <p className="text-xs text-neutral-400">Processing locally on your device...</p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-3 flex gap-3 items-start">
                    <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-200/80">
                        <strong>Privacy Note:</strong> Your passport image is processed entirely in your browser and is never uploaded to our servers. Only the extracted text is sent to complete your booking.
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

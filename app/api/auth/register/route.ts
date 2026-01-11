import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

        // Forward request to Flask backend
        const backendResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(data, { status: backendResponse.status });
        }

        // Create Next.js response
        const response = NextResponse.json({
            success: true,
            data: {
                user: data.data.user,
                accessToken: data.data.tokens.accessToken
            },
            message: data.message
        });

        // Set Refresh Token as HttpOnly Cookie
        const refreshToken = data.data.tokens.refreshToken;

        // Calculate expiration (keep consistent with login logic)
        // Default to 1 day if not specified, or 30 days if implicit?
        // Backend default is 1 hour or 30 days. Let's use 7 days as safe default for registration
        const maxAge = 7 * 24 * 60 * 60;

        response.cookies.set({
            name: 'refresh_token',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: maxAge,
        });

        return response;

    } catch (error: any) {
        console.error('Registration Proxy Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

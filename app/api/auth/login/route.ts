import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Forward login request to backend
        const backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        // Extract tokens
        const { accessToken, refreshToken } = data.data.tokens;

        // Create response
        const response = NextResponse.json({
            success: true,
            data: {
                user: data.data.user,
                accessToken: accessToken, // Client only gets access token
            },
            message: data.message,
        });

        // Set HttpOnly Cookie for refresh token
        // Calculate expiry based on "rememberMe" or default 30 days
        const maxAge = body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

        (await cookies()).set({
            name: "refresh_token",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: maxAge,
        });

        return response;
    } catch (error: any) {
        console.error("Login Proxy Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

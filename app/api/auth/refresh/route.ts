import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "No refresh token found" },
                { status: 401 }
            );
        }

        // Call backend refresh endpoint
        const backendRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
                "Content-Type": "application/json",
            },
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            // If refresh failed (token invalid/revoked), clear cookie
            const response = NextResponse.json(data, { status: backendRes.status });
            cookieStore.delete("refresh_token");
            return response;
        }

        const { accessToken, refreshToken: newRefreshToken } = data.data.tokens;

        const response = NextResponse.json({
            success: true,
            data: {
                accessToken: accessToken,
            },
            message: "Token refreshed",
        });

        // Update refresh token cookie
        cookieStore.set({
            name: "refresh_token",
            value: newRefreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return response;
    } catch (error: any) {
        console.error("Refresh Proxy Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function POST(req: NextRequest) {
    try {
        // Forward logout to backend (optional, but good for blacklisting access token)
        const authHeader = req.headers.get("Authorization");

        if (authHeader) {
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": authHeader,
                    },
                });
            } catch (e) {
                console.warn("Backend logout failed, possibly already expired", e);
            }
        }

        // Always clear the cookie on the client side
        const cookieStore = await cookies();
        cookieStore.delete("refresh_token");

        return NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error: any) {
        console.error("Logout Proxy Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

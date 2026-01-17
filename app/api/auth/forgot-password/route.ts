import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Forward request to backend
        const backendRes = await fetch(`${API_BASE_URL}/auth/password-reset/request`, {
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

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Forgot Password Proxy Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

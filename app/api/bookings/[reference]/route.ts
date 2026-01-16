import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ reference: string }> }
) {
    try {
        const reference = (await params).reference;

        // Forward request to backend
        const backendRes = await fetch(`${API_BASE_URL}/client/dashboard/bookings/reference/${reference}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Booking Lookup Proxy Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const authHeader = request.headers.get("authorization");

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const backendUrl = `${baseUrl}/client/dashboard/bookings/${id}`;

    try {
        const res = await fetch(backendUrl, {
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || "Backend error" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Proxy Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

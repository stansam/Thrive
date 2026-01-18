import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reference: string }> }
) {
    const { reference } = await params;
    const authHeader = request.headers.get("authorization");

    // Construct backend URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    // Backend endpoint: /api/admin/flights/<reference>
    const backendUrl = `${baseUrl}/admin/flights/${reference}`;

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
        console.error("Admin API Proxy Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

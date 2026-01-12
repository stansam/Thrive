
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get("authorization");

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const backendUrl = `${baseUrl}/client/dashboard/packages/explore?${searchParams.toString()}`;

    try {
        const res = await fetch(backendUrl, {
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json({
                    featured: [],
                    all_packages: []
                });
            }
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

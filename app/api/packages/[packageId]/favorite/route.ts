import { NextRequest, NextResponse } from "next/server";

interface Props {
    params: Promise<{ packageId: string }>
}

async function handleRequest(request: NextRequest, props: Props, method: string) {
    const params = await props.params;
    const { packageId } = params;
    const authHeader = request.headers.get("authorization");

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    const backendUrl = `${baseUrl}/packages/${packageId}/favorite`;

    try {
        const res = await fetch(backendUrl, {
            method: method,
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

export async function POST(request: NextRequest, props: Props) {
    return handleRequest(request, props, 'POST');
}

export async function DELETE(request: NextRequest, props: Props) {
    return handleRequest(request, props, 'DELETE');
}

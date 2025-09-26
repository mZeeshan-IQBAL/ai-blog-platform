// src/app/api/pusher/auth/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusherServer";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pusher sends form-encoded body, not JSON
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const socket_id = params.get("socket_id");
    const channel_name = params.get("channel_name");

    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ✅ Generate signed response
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("❌ Pusher auth error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Block GET requests
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
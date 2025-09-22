// app/api/users/sync/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

// ✅ POST: Sync user info
export async function POST(req) {
  try {
    await connectToDB();

    // Debug: Log request details
    console.log("🐛 Debug /api/users/sync request:");
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    console.log("URL:", req.url);
    console.log("Method:", req.method);

    // Check if request has content
    const contentLength = req.headers.get('content-length');
    const contentType = req.headers.get('content-type');
    
    let body = {};
    
    // Only attempt to parse JSON if there's actually content and it's JSON
    if (contentLength && contentLength !== '0' && contentType?.includes('application/json')) {
      try {
        const text = await req.text();
        console.log("🐛 Raw request body:", text);
        if (text.trim()) {
          body = JSON.parse(text);
          console.log("🐛 Parsed body:", body);
        }
      } catch (err) {
        console.warn("Invalid JSON in request:", err.message);
        return NextResponse.json(
          { success: false, message: "Invalid JSON body" },
          { status: 400 }
        );
      }
    } else {
      console.log("🐛 Empty or non-JSON request to users/sync");
      console.log("🐛 Content-Length:", contentLength);
      console.log("🐛 Content-Type:", contentType);
      return NextResponse.json(
        { success: false, message: "No JSON body provided" },
        { status: 400 }
      );
    }

    const { name, email, image, provider, providerId } = body;
    
    if (!email || !providerId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and providerId" },
        { status: 400 }
      );
    }

    // Upsert user
    const user = await User.findOneAndUpdate(
      { providerId },
      { name, email, image, provider, providerId },
      { upsert: true, new: true }
    );

    console.log("✅ User synced successfully:", user._id);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("POST /api/users/sync error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
// app/api/reads/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Read from "@/models/Read";

export async function POST(request) {
  try {
    const { postId, ms } = await request.json();

    if (!postId || !ms) {
      return NextResponse.json(
        { error: "postId and ms are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    await Read.create({
      postId,
      ms,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving read:", err);
    return NextResponse.json(
      { error: "Failed to record read" },
      { status: 500 }
    );
  }
}

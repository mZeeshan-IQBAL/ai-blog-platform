// src/app/api/notify/route.js
import { pusherServer } from "@/lib/pusherServer";

export async function POST(req) {
  try {
    const { userProviderId, type, message, fromUser, extra = {} } = await req.json();

    // Basic validation
    if (!userProviderId || !type || !fromUser) {
      return Response.json(
        { error: "userProviderId, type, and fromUser are required" },
        { status: 400 }
      );
    }

    // Trigger Pusher event to recipient’s private channel
    const channelName = `private-user-${userProviderId}`;
    console.log(`📢 Sending notification on channel: ${channelName}`, {
      type,
      fromUser,
    });

    await pusherServer.trigger(channelName, "notification", {
      type,       // "like" | "comment" | "follow" ...
      message,    // optional human-readable message
      fromUser,   // { id, name, image }
      createdAt: new Date().toISOString(),
      ...extra,   // any extra context you send (e.g., postId, commentId)
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("❌ Notification API error:", error);
    return Response.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
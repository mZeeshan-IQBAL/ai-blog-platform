// src/lib/pusherClient.js
import Pusher from "pusher-js";

let pusherClient = null;

export const getPusherClient = () => {
  // Only run on client-side
  if (typeof window === "undefined") {
    return null;
  }

  // Create singleton instance
  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true,
      authEndpoint: "/api/pusher/auth",
      auth: { 
        withCredentials: true 
      },
      // Add debug mode for development
      enabledTransports: ['ws', 'wss'],
      disabledTransports: ['sockjs']
    });

    // Optional: Log connection events for debugging
    pusherClient.connection.bind("connected", () => {
      console.log("✅ Pusher connected");
    });

    pusherClient.connection.bind("disconnected", () => {
      console.log("❌ Pusher disconnected");
    });

    pusherClient.connection.bind("error", (err) => {
      console.error("🚨 Pusher error:", err);
    });
  }

  return pusherClient;
};
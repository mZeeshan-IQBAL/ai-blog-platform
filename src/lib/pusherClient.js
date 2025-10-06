// src/lib/pusherClient.js
import Pusher from "pusher-js";

let pusherClient = null;
let warned = false;

export const getPusherClient = () => {
  // Only run on client-side
  if (typeof window === "undefined") {
    return null;
  }

  // Ensure env vars exist
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) {
    if (!warned && process.env.NODE_ENV === "development") {
      console.warn(
        "[pusher] Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER. Client will be disabled."
      );
      warned = true;
    }
    return null;
  }

  // Create singleton instance
  if (!pusherClient) {
    if (process.env.NODE_ENV === "development") {
      // Verbose logs in dev to surface connection/auth errors
      Pusher.logToConsole = true;
    }

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
      authEndpoint: "/api/pusher/auth",
      auth: {
        withCredentials: true,
      },
      // Use defaults for transports; Pusher will negotiate the best option.
    });

    // Optional: Log connection events for debugging
    pusherClient.connection.bind("connected", () => {
      console.log("✅ Pusher connected");
    });

    pusherClient.connection.bind("disconnected", () => {
      console.log("❌ Pusher disconnected");
    });

    pusherClient.connection.bind("state_change", (states) => {
      // states = { previous: string, current: string }
      console.log("ℹ️ Pusher state:", states);
    });

    pusherClient.connection.bind("error", (evt) => {
      const { type, error } = evt || {};
      console.error("🚨 Pusher error:", type || evt, error || evt);
    });
  }

  return pusherClient;
};

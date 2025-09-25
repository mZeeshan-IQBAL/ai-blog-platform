// src/lib/pusherServer.js
import Pusher from "pusher";

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Enable debug logging for development
if (process.env.NODE_ENV === 'development') {
  pusherServer.logToConsole = true;
}

export { pusherServer };
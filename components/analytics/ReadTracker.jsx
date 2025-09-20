"use client";
import { useEffect, useRef } from "react";

export default function ReadTracker({ postId }) {
  const startRef = useRef(Date.now());
  const sentRef = useRef(false);

  useEffect(() => {
    const send = async () => {
      if (sentRef.current) return;
      sentRef.current = true;
      const elapsed = Date.now() - startRef.current;
      try {
        navigator.sendBeacon?.(
          "/api/reads",
          new Blob([JSON.stringify({ postId, ms: elapsed })], { type: "application/json" })
        );
      } catch {}
    };

    const t = setTimeout(send, 15000); // send after 15s of reading
    window.addEventListener("beforeunload", send);
    return () => { clearTimeout(t); window.removeEventListener("beforeunload", send); };
  }, [postId]);

  return null;
}
"use client";
// components/chat/FloatingAssistant.jsx
import { useState } from "react";
import dynamic from "next/dynamic";

const ChatbotPortal = dynamic(() => import("@/components/chat/ChatBotPortal"), { ssr: false });

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95 flex items-center justify-center"
        aria-label="Open AI Assistant"
        title="Talk to AI"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Portal */}
      <ChatbotPortal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

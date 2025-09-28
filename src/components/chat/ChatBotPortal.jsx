"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Chatbot from "./Chatbot";

export default function ChatbotPortal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;
  return createPortal(<Chatbot onClose={onClose} />, document.body);
}
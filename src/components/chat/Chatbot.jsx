"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant from AI Knowledge Hub. I can help you find articles, answer questions, or assist with anything else. What would you like to know?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const genId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

  // Send message (can be called with a string to bypass input state)
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || loading) return;

      const userMessage = {
        role: "user",
        content: text,
        timestamp: formatTime(),
        id: genId(),
      };

      const newMessages = [...messagesRef.current, userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      setIsTyping(true);

      try {
        setConnectionStatus("connecting");
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setConnectionStatus("connected");

        const assistantMsg = {
          role: "assistant",
          content:
            data.reply || "I'm sorry, I couldn't process your request right now. Please try again.",
          timestamp: formatTime(),
          id: genId(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("Chatbot error:", err);
        setConnectionStatus("error");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm experiencing some technical difficulties. Please try again in a moment.",
            timestamp: formatTime(),
            id: genId(),
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
        setIsTyping(false);
      }
    },
    [input, loading]
  );

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! How can I help you today?",
        timestamp: formatTime(),
        id: genId(),
      },
    ]);
  };

  const retryLastMessage = () => {
    const lastUserMessage = messagesRef.current.filter((m) => m.role === "user").pop();
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: "Find Articles", action: () => sendMessage("Help me find articles about AI") },
    { text: "What can you do?", action: () => sendMessage("What can you help me with?") },
    { text: "Latest Blogs", action: () => sendMessage("Show me the latest blog posts") },
    { text: "Tech Help", action: () => sendMessage("I need help with a technical issue") },
  ];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[100]">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 brand-gradient rounded-full shadow-glow flex items-center justify-center text-white hover:brightness-110 active:brightness-95 transition-all duration-300 relative"
          aria-label="Open AI Assistant"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {connectionStatus === "error" && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-destructive-foreground text-xs">!</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 top-24 w-96 card shadow-2xl z-[100] flex flex-col">
      {/* Header */}
      <div className="relative brand-gradient text-white card-padding flex-shrink-0 rounded-t-2xl">
        <div className="absolute inset-0 opacity-10 rounded-t-2xl bg-radial-fade">
          <div className="absolute top-2 right-2 w-20 h-20 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-full"></div>
        </div>

        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-success"
                      : connectionStatus === "error"
                      ? "bg-destructive"
                      : "bg-warning"
                  }`}
                />
                <p className="text-xs text-white/80">
                  {connectionStatus === "connected"
                    ? "Online"
                    : connectionStatus === "error"
                    ? "Connection Error"
                    : "Connecting..."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="w-8 h-8 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              title="Clear Chat"
              aria-label="Clear chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              title="Minimize"
              aria-label="Minimize chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              title="Close"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-background">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] ${msg.role === "assistant" ? "order-2" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 brand-gradient rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">AI Assistant</span>
                  {msg.isError && (
                    <button onClick={retryLastMessage} className="text-[10px] text-destructive hover:text-destructive/80 ml-2">
                      Retry
                    </button>
                  )}
                </div>
              )}

              <div
                className={`p-2 rounded-2xl relative transition-all duration-200 ${
                  msg.role === "assistant"
                    ? `bg-card border ${msg.isError ? "border-destructive/20" : "border-border"} text-card-foreground shadow-sm hover:shadow-md`
                    : "brand-gradient text-white shadow-md hover:shadow-lg"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className={`absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 ${msg.isError ? "border-r-destructive/20" : "border-r-border"}`}></div>
                )}
                {msg.role === "user" && (
                  <div className="absolute -right-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-primary"></div>
                )}

                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === "assistant" ? "text-muted-foreground" : "text-white/70"}`}>
                  {msg.timestamp}
                </p>
              </div>

              {msg.role === "user" && (
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="text-[10px] text-muted-foreground font-medium">You</span>
                  <div className="w-5 h-5 brand-gradient rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    U
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {(loading || isTyping) && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 brand-gradient rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-2 bg-muted border-t border-border flex-shrink-0">
        <div className="flex gap-1 flex-wrap">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="px-2 py-1 bg-background border border-border rounded-full text-[10px] text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card flex-shrink-0 rounded-b-2xl">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              rows="1"
              maxLength={500}
              aria-label="Your message"
              className="w-full px-4 py-3 border border-input rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background hover:bg-card transition-colors text-foreground placeholder:text-muted-foreground"
              style={{ minHeight: "44px", maxHeight: "100px" }}
              disabled={loading}
            />
            <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
              {input.length > 0 && `${input.length}/500`}
              <span className="ml-2">Press Enter to send</span>
            </div>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 brand-gradient text-white rounded-2xl hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
            aria-label="Send message"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">
          AI responses may vary. Always verify important information.
        </p>
      </div>
    </div>
  );
}
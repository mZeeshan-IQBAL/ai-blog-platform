"use client";

import { useState, useRef, useEffect } from "react";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "👋 Hi! I'm your AI assistant from AI Knowledge Hub. I can help you find articles, answer questions, or assist with anything else. What would you like to know?",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      role: "user", 
      content: input, 
      timestamp: new Date() 
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.reply || "⚠️ I'm sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "❌ I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform duration-200"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 top-20 w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 z-40 flex flex-col">
      {/* Header - Fixed Height */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-4 flex-shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 w-20 h-20 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-full"></div>
        </div>
        
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div className={`max-w-[85%] ${msg.role === "assistant" ? "order-2" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">AI Assistant</span>
                </div>
              )}
              
              <div
                className={`p-3 rounded-2xl relative ${
                  msg.role === "assistant"
                    ? "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    : "bg-gradient-to-br from-gray-800 to-black text-white shadow-md"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-200"></div>
                )}
                {msg.role === "user" && (
                  <div className="absolute -right-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-800"></div>
                )}
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === "assistant" ? "text-gray-400" : "text-white/60"}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              
              {msg.role === "user" && (
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="text-xs text-gray-500 font-medium">You</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-gray-50 border-t flex-shrink-0">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setInput("Help me find articles about AI")}
            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
          >
            🔍 Find Articles
          </button>
          <button
            onClick={() => setInput("What can you help me with?")}
            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ❓ What can you do?
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message here..."
              rows="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
              style={{ minHeight: '44px', maxHeight: '100px' }}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-11 h-11 bg-gradient-to-br from-gray-800 to-black text-white rounded-2xl hover:from-gray-900 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
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
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI responses may vary. Always verify important information.
        </p>
      </div>
    </div>
  );
}
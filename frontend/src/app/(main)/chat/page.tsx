"use client";

import React, { useState, useRef, useEffect } from "react";
import { AiChatRequest, sendChatMessage } from "@/lib/api";
import { Send, ArrowLeft, Bot, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessageWithId {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Stable epoch for the initial SSR message — avoids hydration mismatch from new Date()
const INITIAL_TIMESTAMP = new Date(0);

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageWithId[]>([
    {
      id: "intro",
      role: "ai",
      content: "Hi! I'm your AI Nutrition Coach. How can I help you reach your goals today?",
      // Use a fixed timestamp for SSR; it gets updated to real time after mount
      timestamp: INITIAL_TIMESTAMP
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Suppress timestamp rendering until client is mounted to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Fix timestamp to real "now" on client, and mark mounted
    setIsMounted(true);
    setMessages(prev => prev.map((m, i) =>
      i === 0 ? { ...m, timestamp: new Date() } : m
    ));
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageWithId = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    const historyPayload = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const request: AiChatRequest = {
        message: userMessage.content,
        history: historyPayload
      };

      const response = await sendChatMessage(request);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: response.reply || (response as any).message || (response as any).response || (response as any).text || "No response",
          timestamp: new Date()
        }
      ]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { reply?: string; message?: string } }; message?: string };
      const serverFeedback =
        err.response?.data?.reply ||
        err.response?.data?.message ||
        err.message ||
        "Failed to connect to server.";
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "I'm temporarily rate limited. Try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] font-sans selection:bg-black selection:text-white">

      {/* Header */}
      <header className="flex-none bg-white/80 backdrop-blur-xl border-b border-gray-100/50 py-4 px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-xl">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-tight">AI Coach</h1>
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gemini 1.5 Pro
              </p>
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-300 font-medium hidden sm:block">
          {messages.length - 1} message{messages.length !== 2 ? "s" : ""}
        </span>
      </header>

      {/* Chat Scroll Area */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "130px" }}
      >
        <div className="max-w-3xl mx-auto space-y-2 p-4 sm:p-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              // Show date separator when message date differs from previous
              const showDate =
                idx === 0 ||
                new Date(msg.timestamp).toDateString() !==
                  new Date(messages[idx - 1].timestamp).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                        {new Date(msg.timestamp).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn(
                      "flex w-full",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex max-w-[85%] sm:max-w-[75%] gap-3 items-end",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-5 shadow-sm",
                          msg.role === "user"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-black text-white"
                        )}
                      >
                        {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                      </div>

                      {/* Bubble + timestamp */}
                      <div className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "px-5 py-3.5 rounded-[1.25rem] text-[15px] leading-relaxed tracking-wide shadow-[0_2px_12px_rgb(0,0,0,0.04)]",
                            msg.role === "user"
                              ? "bg-black text-white rounded-br-sm"
                              : "bg-white border border-gray-100/80 text-gray-800 rounded-bl-sm"
                          )}
                        >
                          {msg.content}
                        </div>
                        {/* Timestamp — client-only to prevent hydration mismatch */}
                        {isMounted && (
                          <span className="text-[10px] text-gray-300 font-medium px-1">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex w-full justify-start"
              >
                <div className="flex gap-3 items-end">
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0 mb-5 shadow-sm">
                    <Bot size={14} />
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <div className="px-5 py-4 rounded-[1.25rem] rounded-bl-sm bg-white border border-gray-100/80 flex items-center gap-1.5 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.65, delay: 0 }} className="w-2 h-2 bg-gray-300 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.65, delay: 0.15 }} className="w-2 h-2 bg-gray-300 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.65, delay: 0.3 }} className="w-2 h-2 bg-gray-300 rounded-full" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium px-1">AI is thinking…</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-white rounded-full p-2 pl-5 shadow-[0_5px_40px_rgba(0,0,0,0.08)] border border-gray-100 transition-all focus-within:shadow-[0_8px_50px_rgba(0,0,0,0.12)] focus-within:border-gray-200"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me about calories, alternatives, or recipes…"
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-[15px] font-medium"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-black text-white p-3.5 rounded-full hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send size={17} className="ml-px" />
            </button>
          </form>
          <p className="text-center mt-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            AI can make mistakes — verify critical dietary info.
          </p>
        </div>
      </div>
    </div>
  );
}

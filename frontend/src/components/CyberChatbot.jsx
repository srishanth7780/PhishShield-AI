"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Shield,
  Sparkles,
  Bot,
  User,
  Trash2,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Key,
  AlertTriangle,
  Zap,
  Cpu,
} from "lucide-react";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")) ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? ""
    : "http://localhost:8000");

const QUICK_PROMPTS = [
  { label: "💡 Ask Stark Anything", query: "Stark, explain quantum computing and tell me what your primary mission is!" },
  { label: "🔑 Connect Gmail Guide", query: "Stark, how do I connect my Gmail address and 16-character App Password?" },
  { label: "🚨 Phishing Red Flags", query: "What are the main risk factors and red flags of a scam email?" },
  { label: "🛡️ 3-Layer Engine Explained", query: "How does PhishShield's 3-layer anti-phishing detection engine work?" },
];

const INITIAL_WELCOME = {
  role: "assistant",
  content:
    "⚡ **I AM STARK.** ⚡\n\nGenius, billionaire cyber-defense architect, and your AI mentor! 🦾\n\nAsk me **ANYTHING** you want — from coding, science, mathematics, and general knowledge, to cybersecurity!\n\n🛡️ *Mission Reminder: I am Stark, built for **PhishShield AI** to protect you from phishing scams, guide your Gmail connection, analyze email threats, and keep your digital life secure!*",
};

export default function CyberChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Load chat history from LocalStorage on initial mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("stark_chat_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load Stark chat history from localStorage", err);
    }
  }, []);

  // 2. Persist chat messages to LocalStorage whenever `messages` changes
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("stark_chat_history", JSON.stringify(messages));
      } catch (err) {
        console.error("Failed to save Stark chat history to localStorage", err);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (userText) => {
    const textToSend = userText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const newHistory = [...messages, { role: "user", content: textToSend.trim() }];
    setMessages(newHistory);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to get response");
      }

      const botReply =
        data.reply ||
        "I am Stark. Jarvis encountered a glitch, try asking again!";

      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ **Stark Tech Alert**: Could not reach Stark AI backend server. Make sure FastAPI is running on `http://localhost:8000`!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const resetState = [
      {
        role: "assistant",
        content:
          "⚡ **Diagnostics Cleared!** Chat history reset from browser LocalStorage. What's next on the agenda?",
      },
    ];
    setMessages(resetState);
    localStorage.removeItem("stark_chat_history");
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 font-body">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full liquid-glass-strong border border-neon-blue/40 text-white shadow-2xl hover:scale-105 hover:bg-neon-blue/20 transition-all duration-300"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 via-amber-500 to-neon-blue flex items-center justify-center shadow-lg shadow-red-500/30">
                <Cpu className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 border-2 border-black rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 border-2 border-black rounded-full" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-none text-white flex items-center gap-1">
                <span>Stark AI</span>
                <span className="px-1.5 py-0.2 bg-red-500/30 border border-red-500/50 rounded text-[9px] font-mono text-amber-300">Genius</span>
              </p>
              <p className="text-[10px] text-cyan-400 font-light leading-tight mt-1">
                I am Stark • Ask queries
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Collapsible Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh] flex flex-col rounded-3xl liquid-glass-strong border border-red-500/30 shadow-2xl overflow-hidden backdrop-blur-2xl animate-slide-up font-body">
          {/* Header */}
          <div className="p-4 bg-black/85 border-b border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-neon-blue flex items-center justify-center shadow-lg shadow-red-500/30">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading italic text-lg text-white leading-none">
                    Stark AI
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded-full">
                    LocalStorage Active
                  </span>
                </div>
                <p className="text-[10px] text-cyan-400 font-light flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse" />
                  I am Stark • Genius Cyber Architect
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear Chat History (LocalStorage)"
                className="p-2 text-gray-400 hover:text-amber-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white/[0.02] border-b border-white/[0.06] overflow-x-auto flex gap-2 scrollbar-none">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt.query)}
                className="px-3 py-1 text-[11px] font-medium text-gray-300 bg-red-500/10 border border-red-500/20 rounded-full whitespace-nowrap hover:bg-red-500/30 hover:border-red-500/50 hover:text-white transition-all"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-body text-xs leading-relaxed">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 border border-neon-blue/50 text-white rounded-br-xs shadow-lg"
                      : "liquid-glass-strong border border-red-500/20 text-gray-200 rounded-bl-xs shadow-md"
                  }`}
                >
                  {msg.content.split("\n").map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className={`${lIdx > 0 ? "mt-1.5" : ""} ${
                        line.startsWith("- ") || line.startsWith("* ")
                          ? "pl-2 border-l border-red-500/40"
                          : ""
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-neon-blue" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-xs text-amber-400 font-light">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                </div>
                <span className="animate-pulse">Stark is analyzing... Jarvis running query...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-black/85 border-t border-white/10 flex items-center gap-2 font-body"
          >
            <input
              type="text"
              placeholder="Ask Stark anything, kid!..."
              className="flex-1 bg-white/[0.04] border border-white/15 text-xs text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-500 transition-all"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600/40 to-amber-500/40 border border-red-500/50 text-amber-200 hover:text-white hover:bg-red-600/60 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

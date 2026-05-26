import React, { useState, useRef, useEffect } from "react";
import { chatCopilot } from "../services/api";
import { Send, User, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_SUGGESTIONS = [
  "How can I prepare for a React developer interview?",
  "Suggest 3 portfolio project ideas using Node.js & AI",
  "How can I improve my GitHub commit consistency?",
  "Tell me what skills are needed for Stripe or Linear"
];

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your P2J Career Copilot. I can help you architect your projects, polish your resume, recommend skills, and prepare for interviews. What's on your mind today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    if (!textToSend) setInput("");
    setError(null);

    const userMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send message history to Gemini API
      const res = await chatCopilot(newMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      console.error(err);
      setError("Failed to reach Career Copilot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950 dark:to-slate-900 border-b border-slate-200 dark:border-indigo-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 dark:text-indigo-400">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              AI Career Copilot
            </h3>
            <p className="text-xs text-indigo-650 dark:text-indigo-300">Intelligent placement & architecture guidance</p>
          </div>
        </div>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-transparent">
        <AnimatePresence initial={false}>
          {messages.map((m, index) => {
            const isUser = m.role === "user";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                    isUser ? "bg-indigo-600 text-white" : "bg-slate-150 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {isUser ? <User size={15} /> : <Sparkles size={15} />}
                </div>

                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-slate-150 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles size={15} className="animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-2 text-rose-600 dark:text-rose-400 text-xs items-center bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-150 dark:border-slate-800/50">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="text-xs shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-indigo-600 dark:text-indigo-200 hover:text-indigo-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          placeholder="Ask about project architecture, portfolio tips, mock interviews..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-550 placeholder-slate-400 dark:placeholder-slate-500 transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:hover:bg-indigo-600"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

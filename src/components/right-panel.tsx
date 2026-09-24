"use client";

import { useState } from "react";
import { Send, Link as LinkIcon, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type InputMode = "question" | "link";

interface RightPanelProps {
  onSubmit: (prompt: string, mode: InputMode, extraData?: string) => void;
  isProcessing: boolean;
}

export function RightPanel({ onSubmit, isProcessing }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<InputMode>("question");
  const [text, setText] = useState("");
  const [linkInput, setLinkInput] = useState("");

  const canSubmit =
    !isProcessing &&
    Boolean(text.trim()) &&
    (activeTab === "question" || Boolean(linkInput.trim()));

  const handleSubmit = () => {
    if (!canSubmit) return;

    let extraData = "";
    if (activeTab === "link") extraData = linkInput;

    onSubmit(text, activeTab, extraData);
  };

  return (
    <div className="w-full min-h-[280px] md:h-full md:min-h-0 glass-panel rounded-2xl flex flex-col overflow-hidden relative border border-white/5 shadow-2xl">
      <div className="flex items-center p-2 gap-2 border-b border-white/5 bg-zinc-900/50 flex-wrap">
        {[
          { id: "question" as const, icon: MessageSquare, label: "Question" },
          { id: "link" as const, icon: LinkIcon, label: "News Link" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
              activeTab === tab.id
                ? "text-white bg-white/10"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <tab.icon size={16} className="relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
        <AnimatePresence mode="popLayout">
          {activeTab === "link" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-2"
            >
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-1">
                Target URL
              </label>
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <div className="mt-auto bg-zinc-900 border border-white/10 rounded-2xl flex flex-col shadow-inner overflow-hidden focus-within:ring-1 focus-within:ring-white/20 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            placeholder={
              activeTab === "question"
                ? "Ask the Jev 8 Ball..."
                : "What should Jev analyze in this link?"
            }
            className="w-full bg-transparent p-4 min-h-[120px] resize-none text-white focus:outline-none placeholder-zinc-600"
          />

          <div className="flex items-center justify-end p-3 border-t border-white/5 bg-zinc-950/50">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${
                !canSubmit
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              }`}
            >
              {isProcessing ? "Asking Jev..." : "Ask Jev"}
              {!isProcessing && <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

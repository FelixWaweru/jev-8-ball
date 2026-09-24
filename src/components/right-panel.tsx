"use client";

import { useState } from "react";
import { Send, Github, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DecisionPanel } from "@/components/decision-panel";
import type { JevDecisionResult } from "@/lib/jev/types";

export type InputMode = "question" | "repo";

export interface RepoSubmitExtra {
  url: string;
  branch: string;
}

interface RightPanelProps {
  onSubmit: (
    prompt: string,
    mode: InputMode,
    extraData?: RepoSubmitExtra
  ) => void;
  isProcessing: boolean;
  result: JevDecisionResult | null;
  latencySeconds: number | null;
  repo: { owner: string; name: string } | null;
  onDismissResult?: () => void;
  onModeChange?: (mode: InputMode) => void;
}

export function RightPanel({
  onSubmit,
  isProcessing,
  result,
  latencySeconds,
  repo,
  onDismissResult,
  onModeChange,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<InputMode>("question");
  const [text, setText] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");

  const setTab = (mode: InputMode) => {
    setActiveTab(mode);
    onModeChange?.(mode);
  };

  const canSubmit =
    !isProcessing &&
    Boolean(text.trim()) &&
    (activeTab === "question" || Boolean(repoUrl.trim()));

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (activeTab === "repo") {
      onSubmit(text, "repo", { url: repoUrl.trim(), branch: branch.trim() });
      return;
    }

    onSubmit(text, "question");
  };

  return (
    <div className="w-full min-h-[280px] md:h-full md:min-h-0 glass-panel rounded-2xl flex flex-col overflow-hidden relative border border-white/5 shadow-2xl">
      <div className="flex items-center p-2 gap-2 border-b border-white/5 bg-zinc-900/50 flex-wrap">
        {[
          { id: "question" as const, icon: MessageSquare, label: "Question" },
          { id: "repo" as const, icon: Github, label: "GitHub Repo" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
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
          {activeTab === "repo" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-1">
                  Repo URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && latencySeconds !== null && (
            <DecisionPanel
              result={result}
              latencySeconds={latencySeconds}
              repo={repo}
              onDismiss={onDismissResult}
            />
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
                : "What should Jev answer about this repo?"
            }
            className="w-full bg-transparent p-4 min-h-[120px] resize-none text-white focus:outline-none placeholder-zinc-600"
          />

          <div className="flex items-center justify-end p-3 border-t border-white/5 bg-zinc-950/50">
            <button
              type="button"
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

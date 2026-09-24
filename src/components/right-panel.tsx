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
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-white/5 glass-panel">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/5 bg-zinc-900/50 p-1">
        {[
          { id: "question" as const, icon: MessageSquare, label: "Question" },
          { id: "repo" as const, icon: Github, label: "GitHub Repo" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`relative flex items-center gap-1.5 overflow-hidden rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 rounded-lg border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <tab.icon size={13} className="relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <AnimatePresence mode="popLayout">
          {activeTab === "repo" && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              className="grid shrink-0 grid-cols-[minmax(0,1fr)_5.5rem] gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]"
            >
              <label className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[9px] font-semibold tracking-widest text-zinc-500 uppercase">
                  Repo URL
                </span>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[9px] font-semibold tracking-widest text-zinc-500 uppercase">
                  Branch
                </span>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                />
              </label>
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

        {!result && (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 px-3 py-2 text-center text-[11px] leading-snug text-zinc-500">
            <span>
              Ask a question to see other likely answers.
              {activeTab === "repo" && (
                <>
                  <br />
                  Ask a question to see likely answers about your code.
                </>
              )}
            </span>
          </div>
        )}

        <div className="mt-auto flex shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            placeholder={
              activeTab === "question"
                ? "Ask the Jev 8 Ball..."
                : "What should Jev answer about this repo?"
            }
            className="min-h-[4.5rem] w-full resize-none bg-transparent p-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-end border-t border-white/5 bg-zinc-950/50 p-1.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                !canSubmit
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {isProcessing ? "Asking Jev..." : "Ask Jev"}
              {!isProcessing && <Send size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

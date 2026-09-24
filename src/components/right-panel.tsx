"use client";

import { useState, type KeyboardEvent } from "react";
import { Send, Github, MessageSquare, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DecisionPanel } from "@/components/decision-panel";
import type { JevDecisionResult } from "@/lib/jev/types";

export type InputMode = "question" | "repo";

export interface RepoSubmitExtra {
  url: string;
  branch: string;
}

export interface TabDecisionState {
  result: JevDecisionResult | null;
  latencySeconds: number | null;
  repo: { owner: string; name: string } | null;
}

interface RightPanelProps {
  onSubmit: (
    prompt: string,
    mode: InputMode,
    extraData?: RepoSubmitExtra
  ) => void;
  isProcessing: boolean;
  decisionsByMode: Record<InputMode, TabDecisionState>;
  activeMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onDismissResult?: () => void;
}

export function RightPanel({
  onSubmit,
  isProcessing,
  decisionsByMode,
  activeMode,
  onModeChange,
  onDismissResult,
}: RightPanelProps) {
  const [text, setText] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");

  const activeDecision = decisionsByMode[activeMode];
  const result = activeDecision.result;
  const latencySeconds = activeDecision.latencySeconds;
  const repo = activeDecision.repo;

  const canSubmit =
    !isProcessing &&
    Boolean(text.trim()) &&
    (activeMode === "question" || Boolean(repoUrl.trim()));

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (activeMode === "repo") {
      onSubmit(text, "repo", { url: repoUrl.trim(), branch: branch.trim() });
      return;
    }

    onSubmit(text, "question");
  };

  const handleAskKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    handleSubmit();
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
            onClick={() => onModeChange(tab.id)}
            className={`relative flex items-center gap-1.5 overflow-hidden rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === tab.id
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            {activeMode === tab.id && (
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
          {activeMode === "repo" && (
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
              key={activeMode}
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
              {activeMode === "repo"
                ? "Ask a question to see likely answers about your code."
                : "Ask a question to see other likely answers."}
            </span>
          </div>
        )}

        <div className="mt-auto flex shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleAskKeyDown}
            disabled={isProcessing}
            placeholder={
              activeMode === "question"
                ? "Ask the Jev 8 Ball..."
                : "What should Jev answer about this repo?"
            }
            className="min-h-[4.5rem] w-full resize-none bg-transparent p-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-2 border-t border-white/5 bg-zinc-950/50 p-1.5">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
              <Check
                size={13}
                className={
                  activeMode === "repo"
                    ? "flex-shrink-0 text-green-400"
                    : "flex-shrink-0 text-zinc-500"
                }
                aria-hidden
              />
              <a
                href="https://codefundi.app/?utm_source=jev-8-ball&utm_medium=referral&utm_campaign=jev-8-ball"
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-zinc-300 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                CodeFundi
              </a>
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
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

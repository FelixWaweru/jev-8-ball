"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { JevDecisionResult } from "@/lib/jev/types";

interface DecisionPanelProps {
  result: JevDecisionResult;
  latencySeconds: number;
  repo?: { owner: string; name: string } | null;
  onDismiss?: () => void;
}

export function DecisionPanel({
  result,
  latencySeconds,
  repo,
  onDismiss,
}: DecisionPanelProps) {
  const top3 = result.ranked.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="w-full rounded-xl border border-white/10 bg-zinc-950/80 overflow-hidden flex flex-col shrink-0"
    >
      <div className="flex items-center justify-between gap-2 p-3 px-4 border-b border-white/10 bg-zinc-900/50">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 min-w-0 flex-wrap">
          <span className="w-2 h-2 flex-shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
          <span>Decision Reached</span>
          <span className="text-green-400 font-semibold tabular-nums text-xs sm:text-sm">
            {latencySeconds.toFixed(2)}s
          </span>
        </h3>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Dismiss decision"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {repo && (
          <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
            <span className="text-zinc-500">repo</span>
            <span className="font-medium text-white truncate max-w-[220px]">
              {repo.owner}/{repo.name}
            </span>
          </div>
        )}

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-1">
            Answer
          </p>
          <p className="text-base text-blue-50 font-medium leading-snug">
            {result.phrase}
          </p>
          <p className="mt-1.5 text-xs text-blue-300/80 tabular-nums">
            {(result.confidence * 100).toFixed(0)}% confidence
            {result.usage?.cost !== undefined && (
              <span className="text-zinc-500">
                {" "}
                · ${result.usage.cost.toFixed(6)}
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Top probabilities
          </p>
          <ul className="space-y-1.5">
            {top3.map((item, index) => (
              <li
                key={item.id}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-sm ${
                  item.id === result.choiceId
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-zinc-900/50 border-white/5"
                }`}
              >
                <span className="text-zinc-200 min-w-0 truncate">
                  <span className="text-zinc-500 mr-1.5 tabular-nums">
                    {index + 1}.
                  </span>
                  {item.label}
                </span>
                <span className="text-xs font-semibold text-zinc-400 tabular-nums flex-shrink-0">
                  {(item.probability * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

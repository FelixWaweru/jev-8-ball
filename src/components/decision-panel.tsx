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

function formatPercent(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}

export function DecisionPanel({
  result,
  latencySeconds,
  repo,
  onDismiss,
}: DecisionPanelProps) {
  const rows = result.alternatives.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/80"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-zinc-900/50 px-2.5 py-1.5">
        <h3 className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-bold text-white">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />
          <span>Decision Reached</span>
          <span className="text-[11px] font-semibold text-green-400 tabular-nums">
            {latencySeconds.toFixed(2)}s
          </span>
        </h3>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss decision"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {repo && (
          <div className="inline-flex max-w-full self-start items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
            <span className="text-zinc-500">repo</span>
            <span className="truncate font-medium text-white">
              {repo.owner}/{repo.name}
            </span>
          </div>
        )}

        <div className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-2">
          <p className="mb-0.5 text-[9px] font-semibold tracking-widest text-blue-400 uppercase">
            Answer
          </p>
          <p className="text-sm leading-snug font-medium text-blue-50">
            {result.phrase}
          </p>
          <p className="mt-1 text-[11px] text-blue-300/80 tabular-nums">
            {(result.confidence * 100).toFixed(0)}% confidence
            {result.usage?.cost !== undefined && (
              <span className="text-zinc-500">
                {" "}
                · ${result.usage.cost.toFixed(6)}
              </span>
            )}
          </p>
        </div>

        {rows.length > 0 && (
          <div>
            <p className="mb-1.5 text-[9px] font-semibold tracking-widest text-zinc-500 uppercase">
              Other likely answers
            </p>
            <ul className="space-y-1">
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="flex h-8 items-center gap-2 rounded-md border border-white/5 bg-zinc-900 px-2"
                >
                  <p
                    className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-200"
                    title={item.label}
                  >
                    {item.label}
                  </p>
                  <span className="flex h-5 min-w-[2.75rem] flex-shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2 text-[10px] font-bold text-blue-300 tabular-nums">
                    {formatPercent(item.probability)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

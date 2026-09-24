"use client";

import { motion } from "framer-motion";
import type { RankedOutcome } from "@/lib/jev/types";

interface ProbabilityCardsProps {
  alternatives: RankedOutcome[];
  isLoading?: boolean;
}

function formatPercent(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}

export function ProbabilityCards({
  alternatives,
  isLoading = false,
}: ProbabilityCardsProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-lg mx-auto mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <motion.div
            key={`skeleton-${idx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-zinc-900/60 border border-white/5 rounded-lg p-3 h-[4.25rem] animate-pulse ${
              idx === 4 ? "sm:col-span-2 sm:max-w-[calc(50%-0.375rem)] sm:mx-auto sm:w-full" : ""
            }`}
          />
        ))}
      </div>
    );
  }

  if (alternatives.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto mt-6 sm:mt-8 min-h-20 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-zinc-500 text-sm px-4 text-center">
        Ask a question to see other likely answers.
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {alternatives.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.08 }}
          className={`bg-zinc-900 border border-white/5 rounded-lg p-3 flex items-center gap-3 shadow-lg relative overflow-hidden ${
            idx === alternatives.length - 1 && alternatives.length % 2 === 1
              ? "sm:col-span-2 sm:max-w-[calc(50%-0.375rem)] sm:mx-auto sm:w-full"
              : ""
          }`}
        >
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold text-zinc-200 line-clamp-2"
              title={item.label}
            >
              {item.label}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5 tabular-nums">
              {formatPercent(item.probability)}
            </p>
          </div>
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center"
            aria-hidden
          >
            <span className="text-[10px] font-bold text-blue-300 tabular-nums">
              {formatPercent(item.probability)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

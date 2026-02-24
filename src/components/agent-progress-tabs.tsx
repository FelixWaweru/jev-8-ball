"use client";

import { motion } from "framer-motion";
import { Agent } from "@/lib/dispersl/global.types";

export type AgentStatus = "idle" | "pending" | "active" | "completed" | "error";

export interface AgentProgressConfig {
  agent: Agent;
  status: AgentStatus;
}

const statusColors = {
  idle: "bg-zinc-600",
  pending: "bg-yellow-500",
  active: "bg-green-500",
  completed: "bg-blue-500",
  error: "bg-red-500",
};

export function AgentProgressTabs({ agentsConfig }: { agentsConfig: AgentProgressConfig[] }) {
  if (agentsConfig.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto mt-8 h-20 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
        No agents selected
      </div>
    );
  }

  // 3 cols x 2 rows Max Support (6 agents max for this UI ideally)
  const displayAgents = agentsConfig.slice(0, 6);

  return (
    <div className="w-full max-w-md mx-auto mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3">
      {displayAgents.map(({ agent, status }, idx) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-zinc-900 border border-white/5 rounded-lg p-3 flex items-center gap-3 shadow-lg relative overflow-hidden group"
        >
          {/* Status Indicator Glow */}
          {status === "active" && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-green-500/10 pointer-events-none"
            />
          )}

          <div className="relative flex-shrink-0">
            {/* Status Dot */}
            <div className="relative flex h-3 w-3">
              {status === "active" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${statusColors[status]}`}
              ></span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate" title={agent.name}>
              {agent.name}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
              {status}
            </p>
          </div>
        </motion.div>
      ))
      }
    </div >
  );
}

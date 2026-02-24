"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Magic8Ball } from "@/components/magic-8-ball";
import { AgentProgressTabs, AgentStatus, AgentProgressConfig } from "@/components/agent-progress-tabs";
import { RightPanel, InputMode } from "@/components/right-panel";
import { useApiKey } from "@/context/api-key-context";
import { DispersalAPIClient } from "@/lib/dispersl/client";
import { executeAgenticConsensus, ConsensusResult } from "@/lib/dispersl/consensus";
import { Agent } from "@/lib/dispersl/global.types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Home() {
  const { apiKey } = useApiKey();
  const { apiKey } = useApiKey();
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [agentProgress, setAgentProgress] = useState<AgentProgressConfig[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [ballText, setBallText] = useState("ASK ME ANYTHING");
  const [resultJson, setResultJson] = useState<ConsensusResult | null>(null);

  const handleAgentToggle = (agent: Agent) => {
    setSelectedAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) {
        return prev.filter((a) => a.id !== agent.id);
      } else {
        return [...prev, agent];
      }
    });
  };

  // Sync selected agents to progress view initially
  useEffect(() => {
    if (!isProcessing) {
      setAgentProgress(
        selectedAgents.map(agent => ({ agent, status: "idle" as AgentStatus }))
      );
    }
  }, [selectedAgents, isProcessing]);

  const handleSubmit = async (prompt: string, mode: InputMode, extraData?: string) => {
    if (!apiKey) {
      setBallText("API KEY REQUIRED");
      return;
    }
    if (selectedAgents.length === 0) return;

    setIsProcessing(true);
    setBallText("CONSULTING AGENTS...");
    setResultJson(null);

    // Initial pending state
    setAgentProgress(
      selectedAgents.map(agent => ({ agent, status: "pending" as AgentStatus }))
    );

    let finalPrompt = prompt;

    // Handle scraping / extra data
    if (mode === "link" && extraData) {
      setBallText("SCRAPING LINK...");
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: extraData }),
        });
        if (res.ok) {
          const { text } = await res.json();
          finalPrompt += `\n\nContext from link (${extraData}):\n${text}`;
        } else {
          finalPrompt += `\n\n[Failed to scrape link: ${extraData}]`;
        }
      } catch (e) {
        console.error(e);
      }
      setBallText("CONSULTING AGENTS...");
    } else if (mode === "image" && extraData) {
      finalPrompt += `\n\n[Image attached as Base64 format: ${extraData.substring(0, 50)}...]`;
    }

    try {
      const result = await executeAgenticConsensus(
        apiKey,
        finalPrompt,
        selectedAgents,
        (agent) => {
          // Update specific agent to active when they stream data
          setAgentProgress((prev) =>
            prev.map((ap) =>
              ap.agent.id === agent.id ? { ...ap, status: "active" as AgentStatus } : ap
            )
          );
        }
      );

      // Finish state
      setAgentProgress(
        selectedAgents.map(agent => ({ agent, status: "completed" as AgentStatus }))
      );

      setResultJson(result);
      setBallText(result.quickResponse.toUpperCase().slice(0, 40));
    } catch (error) {
      console.error(error);
      setBallText("CONSENSUS FAILED");
      setAgentProgress(
        selectedAgents.map(agent => ({ agent, status: "error" as AgentStatus }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-8">
        {/* Left Column - 8 Ball + Progress */}
        <section className="w-full md:w-1/2 flex flex-col justify-center gap-8 min-h-[500px] relative">
          <div className="flex-1 flex flex-col items-center justify-center">
            <Magic8Ball
              text={ballText}
              isThinking={isProcessing}
              responses={resultJson?.agentResponses}
            />
            <AgentProgressTabs agentsConfig={agentProgress} />
          </div>
        </section>

        {/* Right Column - Tabs + Inputs */}
        <section className="w-full md:w-1/2 h-full py-4 pb-8">
          <RightPanel
            selectedAgents={selectedAgents}
            onAgentToggle={handleAgentToggle}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
          />
        </section>
      </main>

      {/* Result Modal Overlay */}
      <AnimatePresence>
        {resultJson && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-full bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
            >
              <div className="flex flex-shrink-0 items-center justify-between p-4 px-6 border-b border-white/10 bg-zinc-900/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
                  Consensus Reached
                </h3>
                <button
                  onClick={() => setResultJson(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-2">Quick Response</h4>
                  <p className="text-lg md:text-xl text-blue-50 font-medium leading-relaxed">
                    {resultJson.quickResponse}
                  </p>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">JSON Aggregate Data</h4>
                  <pre className="w-full p-4 rounded-xl bg-zinc-900 border border-white/5 text-xs md:text-sm text-zinc-300 overflow-x-auto custom-scrollbar font-mono leading-relaxed">
                    {JSON.stringify(resultJson, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

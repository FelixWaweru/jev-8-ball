"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Jev8Ball } from "@/components/jev-8-ball";
import { ProbabilityCards } from "@/components/probability-cards";
import { RightPanel, InputMode } from "@/components/right-panel";
import { useApiKey } from "@/context/api-key-context";
import { askJevEightBall } from "@/lib/jev/client";
import { JevRequestError, type JevDecisionResult } from "@/lib/jev/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function ballTextForError(error: unknown): string {
  if (error instanceof JevRequestError) {
    if (error.status === 401) return "INVALID API KEY";
    if (error.status === 402) return "CREDITS REQUIRED";
    if (error.status === 429) return "RATE LIMITED";
    if (error.status !== null && error.status >= 500) return "REPLY HAZY";
    return "DECISION FAILED";
  }
  return "DECISION FAILED";
}

export default function Home() {
  const { apiKey } = useApiKey();
  const [isProcessing, setIsProcessing] = useState(false);
  const [ballText, setBallText] = useState("ASK ME ANYTHING");
  const [result, setResult] = useState<JevDecisionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (
    prompt: string,
    mode: InputMode,
    extraData?: string
  ) => {
    if (!apiKey) {
      setBallText("API KEY REQUIRED");
      return;
    }
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setBallText("ASKING JEV...");
    setResult(null);
    setErrorMessage(null);

    const question = prompt.trim();
    let sourceUrl: string | undefined;
    let context: string | undefined;

    if (mode === "link" && extraData) {
      setBallText("SCRAPING LINK...");
      sourceUrl = extraData;
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: extraData }),
        });
        if (res.ok) {
          const { text } = await res.json();
          context = typeof text === "string" ? text : undefined;
        } else {
          context = `[Failed to scrape link: ${extraData}]`;
        }
      } catch {
        context = `[Failed to scrape link: ${extraData}]`;
      }
      setBallText("ASKING JEV...");
    }

    try {
      const decision = await askJevEightBall(apiKey, {
        question,
        sourceUrl,
        context,
      });
      setResult(decision);
      setBallText(decision.phrase.toUpperCase());
    } catch (error) {
      console.error(error);
      setResult(null);
      setBallText(ballTextForError(error));
      setErrorMessage(
        error instanceof Error ? error.message : "Decision failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 py-4 md:px-8 md:py-8 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 md:h-[calc(100vh-4rem)] md:min-h-0 md:overflow-hidden">
        <section className="w-full md:w-1/2 flex flex-col justify-center gap-4 sm:gap-6 md:gap-8 relative md:min-h-0 md:overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <Jev8Ball
              text={ballText}
              isThinking={isProcessing}
              confidence={result?.confidence}
            />
            <ProbabilityCards
              alternatives={result?.alternatives ?? []}
              isLoading={isProcessing}
            />
            {errorMessage && !isProcessing && !result && (
              <p className="mt-3 text-xs text-red-400/80 text-center max-w-md px-2">
                {errorMessage}
              </p>
            )}
          </div>
        </section>

        <section className="w-full md:w-1/2 md:h-full md:min-h-0 py-2 md:py-4 md:pb-8">
          <RightPanel onSubmit={handleSubmit} isProcessing={isProcessing} />
        </section>
      </main>

      <AnimatePresence>
        {result && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[min(90dvh,100%)] bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
            >
              <div className="flex flex-shrink-0 items-center justify-between p-4 px-6 border-b border-white/10 bg-zinc-900/50 sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
                  Decision Reached
                </h3>
                <button
                  onClick={() => setResult(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-2">
                    Answer
                  </h4>
                  <p className="text-lg md:text-xl text-blue-50 font-medium leading-relaxed">
                    {result.phrase}
                  </p>
                  <p className="mt-2 text-sm text-blue-300/80 tabular-nums">
                    {(result.confidence * 100).toFixed(0)}% confidence
                    {result.usage?.cost !== undefined && (
                      <span className="text-zinc-500">
                        {" "}
                        · ${result.usage.cost.toFixed(6)} OpenRouter
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Probability Ranking
                  </h4>
                  <ul className="space-y-2">
                    {result.ranked.map((item, index) => (
                      <li
                        key={item.id}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${
                          item.id === result.choiceId
                            ? "bg-blue-500/10 border-blue-500/30"
                            : "bg-zinc-900/50 border-white/5"
                        }`}
                      >
                        <span className="text-sm text-zinc-200 min-w-0 truncate">
                          <span className="text-zinc-500 mr-2 tabular-nums">
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
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

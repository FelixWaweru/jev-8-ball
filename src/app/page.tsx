"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Jev8Ball } from "@/components/jev-8-ball";
import { ProbabilityCards } from "@/components/probability-cards";
import {
  RightPanel,
  InputMode,
  type RepoSubmitExtra,
} from "@/components/right-panel";
import { useApiKey } from "@/context/api-key-context";
import { askJevEightBall } from "@/lib/jev/client";
import { JevRequestError, type JevDecisionResult } from "@/lib/jev/types";
import {
  normalizeRepoUrl,
  parseGithubOwnerRepo,
} from "@/lib/codefundi/repo-url";
import { hasBlueprintPayload, serializeRepoContext } from "@/lib/codefundi/serialize";
import type {
  RepoBlueprint,
  RepositoryIndexInitRepo,
} from "@/lib/codefundi/types";

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
  const [jevLatencySeconds, setJevLatencySeconds] = useState<number | null>(
    null
  );
  const [repoIdentity, setRepoIdentity] = useState<{
    owner: string;
    name: string;
  } | null>(null);
  const [uiMode, setUiMode] = useState<InputMode>("question");

  const handleSubmit = async (
    prompt: string,
    mode: InputMode,
    extraData?: RepoSubmitExtra
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
    setJevLatencySeconds(null);
    setRepoIdentity(null);
    setUiMode(mode);

    const question = prompt.trim();
    let sourceUrl: string | undefined;
    let context: string | undefined;
    let identity: { owner: string; name: string } | null = null;

    try {
      if (mode === "repo" && extraData?.url) {
        setBallText("SCANNING REPO...");
        const url = normalizeRepoUrl(extraData.url);
        identity = parseGithubOwnerRepo(url);
        sourceUrl = url;

        let blueprint: RepoBlueprint | null = null;
        let index: RepositoryIndexInitRepo | null = null;

        const bpRes = await fetch("/api/codefundi/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (bpRes.ok) {
          const bpJson = await bpRes.json();
          blueprint = bpJson.blueprint ?? null;
        } else if (bpRes.status !== 404 && bpRes.status !== 400) {
          const errBody = await bpRes.json().catch(() => ({}));
          throw new Error(
            (errBody as { error?: string }).error ||
              "Failed to load repo blueprint"
          );
        }

        if (!hasBlueprintPayload(blueprint)) {
          setBallText("SCANNING REPO...");
          const idxRes = await fetch("/api/codefundi/index", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url,
              branch: extraData.branch || undefined,
            }),
          });
          if (!idxRes.ok) {
            const errBody = await idxRes.json().catch(() => ({}));
            throw new Error(
              (errBody as { error?: string }).error ||
                "Failed to index repository"
            );
          }
          const idxJson = await idxRes.json();
          index = idxJson.index ?? null;
        }

        context = serializeRepoContext({
          repoUrl: url,
          branch: extraData.branch,
          blueprint,
          index,
        });
        setRepoIdentity(identity);
        setBallText("ASKING JEV...");
      }

      const t0 = performance.now();
      const decision = await askJevEightBall(apiKey, {
        question,
        sourceUrl,
        context,
      });
      const latencySeconds = (performance.now() - t0) / 1000;

      setJevLatencySeconds(latencySeconds);
      setResult(decision);
      setBallText(decision.phrase.toUpperCase());
    } catch (error) {
      console.error(error);
      setResult(null);
      setJevLatencySeconds(null);
      setRepoIdentity(null);
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
        <section className="w-full md:w-1/2 flex flex-col justify-center gap-4 sm:gap-6 md:gap-8 relative md:min-h-0 md:overflow-y-auto md:overflow-x-visible px-1 sm:px-2 pb-4">
          <div className="flex-1 flex flex-col items-center justify-center py-2 min-w-0">
            <div className="w-full max-w-[min(24rem,100%)] aspect-square mx-auto p-2 sm:p-3 overflow-visible shrink-0">
              <Jev8Ball
                text={ballText}
                isThinking={isProcessing}
                confidence={result?.confidence}
              />
            </div>
            <ProbabilityCards
              alternatives={result?.alternatives ?? []}
              isLoading={isProcessing}
              mode={uiMode}
            />
            {errorMessage && !isProcessing && !result && (
              <p className="mt-3 text-xs text-red-400/80 text-center max-w-md px-2">
                {errorMessage}
              </p>
            )}
          </div>
        </section>

        <section className="w-full md:w-1/2 md:h-full md:min-h-0 py-2 md:py-4 md:pb-8">
          <RightPanel
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            result={result}
            latencySeconds={jevLatencySeconds}
            repo={result ? repoIdentity : null}
            onDismissResult={() => {
              setResult(null);
              setJevLatencySeconds(null);
            }}
            onModeChange={setUiMode}
          />
        </section>
      </main>
    </>
  );
}

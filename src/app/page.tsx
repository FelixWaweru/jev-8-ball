"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Jev8Ball } from "@/components/jev-8-ball";
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
    <div className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
      <Header />
      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-3 px-3 py-2 md:flex-row md:overflow-hidden">
        <section className="@container/ball flex min-h-[min(72vw,22rem)] w-full min-w-0 flex-col items-center justify-center md:h-full md:min-h-0 md:w-1/2">
          <div className="aspect-square w-[min(100%,22rem)] md:w-[min(100cqw,100cqh)]">
            <Jev8Ball
              text={ballText}
              isThinking={isProcessing}
              confidence={result?.confidence}
            />
          </div>
          {errorMessage && !isProcessing && !result && (
            <p className="mt-2 max-w-sm px-2 text-center text-[11px] text-red-400/80">
              {errorMessage}
            </p>
          )}
        </section>

        <section className="flex min-h-[22rem] w-full min-w-0 flex-1 md:h-full md:min-h-0 md:w-1/2">
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
          />
        </section>
      </main>
    </div>
  );
}

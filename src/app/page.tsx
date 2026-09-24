"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Jev8Ball } from "@/components/jev-8-ball";
import {
  RightPanel,
  InputMode,
  type RepoSubmitExtra,
  type TabDecisionState,
} from "@/components/right-panel";
import { useApiKey } from "@/context/api-key-context";
import { askJevEightBall } from "@/lib/jev/client";
import { JevRequestError } from "@/lib/jev/types";
import {
  normalizeRepoUrl,
  parseGithubOwnerRepo,
} from "@/lib/codefundi/repo-url";
import { hasBlueprintPayload, serializeRepoContext } from "@/lib/codefundi/serialize";
import type {
  RepoBlueprint,
  RepositoryIndexInitRepo,
} from "@/lib/codefundi/types";

const EMPTY_TAB_DECISION: TabDecisionState = {
  result: null,
  latencySeconds: null,
  repo: null,
};

function emptyDecisions(): Record<InputMode, TabDecisionState> {
  return {
    question: { ...EMPTY_TAB_DECISION },
    repo: { ...EMPTY_TAB_DECISION },
  };
}

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

function ballTextForTab(decision: TabDecisionState): string {
  if (decision.result) return decision.result.phrase.toUpperCase();
  return "ASK ME ANYTHING";
}

export default function Home() {
  const { apiKey, openApiKeyDialog } = useApiKey();
  const [activeMode, setActiveMode] = useState<InputMode>("question");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ballText, setBallText] = useState("ASK ME ANYTHING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [decisionsByMode, setDecisionsByMode] = useState(emptyDecisions);

  const activeDecision = decisionsByMode[activeMode];

  const setTabDecision = (
    mode: InputMode,
    patch: Partial<TabDecisionState>
  ) => {
    setDecisionsByMode((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], ...patch },
    }));
  };

  const handleModeChange = (mode: InputMode) => {
    setActiveMode(mode);
    if (!isProcessing) {
      setBallText(ballTextForTab(decisionsByMode[mode]));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (
    prompt: string,
    mode: InputMode,
    extraData?: RepoSubmitExtra
  ) => {
    if (!apiKey) {
      setBallText("API KEY REQUIRED");
      openApiKeyDialog();
      return;
    }
    if (!prompt.trim()) return;

    setActiveMode(mode);
    setIsProcessing(true);
    setBallText("ASKING JEV...");
    setErrorMessage(null);
    setTabDecision(mode, {
      result: null,
      latencySeconds: null,
      repo: null,
    });

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
        setBallText("ASKING JEV...");
      }

      const t0 = performance.now();
      const decision = await askJevEightBall(apiKey, {
        question,
        sourceUrl,
        context,
      });
      const latencySeconds = (performance.now() - t0) / 1000;

      setTabDecision(mode, {
        result: decision,
        latencySeconds,
        repo: identity,
      });
      setBallText(decision.phrase.toUpperCase());
    } catch (error) {
      console.error(error);
      setTabDecision(mode, {
        result: null,
        latencySeconds: null,
        repo: null,
      });
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
        <section className="relative w-full min-h-[min(72vw,20rem)] min-w-0 md:h-full md:min-h-0 md:w-1/2 md:overflow-hidden">
          <div
            className="flex h-[min(72vw,20rem)] w-full items-center justify-center md:absolute md:inset-0 md:h-auto"
            style={{ containerType: "size" }}
          >
            {/*
              Size container (not inline-size) so 100cqh is the pane height.
              Side length is min(width, height) so the square never crops.
            */}
            <div className="aspect-square h-[min(100%,20rem)] w-[min(100%,20rem)] max-h-full max-w-full md:h-[min(100cqw,100cqh)] md:w-[min(100cqw,100cqh)]">
              <Jev8Ball
                text={ballText}
                isThinking={isProcessing}
                confidence={activeDecision.result?.confidence}
              />
            </div>
          </div>
          {errorMessage && !isProcessing && !activeDecision.result && (
            <p className="pointer-events-none absolute bottom-1 left-1/2 z-10 max-w-sm -translate-x-1/2 px-2 text-center text-[11px] text-red-400/80">
              {errorMessage}
            </p>
          )}
        </section>

        <section className="flex min-h-[22rem] w-full min-w-0 flex-1 md:h-full md:min-h-0 md:w-1/2">
          <RightPanel
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            decisionsByMode={decisionsByMode}
            activeMode={activeMode}
            onModeChange={handleModeChange}
            onDismissResult={() => {
              setTabDecision(activeMode, {
                result: null,
                latencySeconds: null,
                repo: null,
              });
              setBallText("ASK ME ANYTHING");
            }}
          />
        </section>
      </main>
    </div>
  );
}

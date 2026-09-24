import { criteriaMap, isKnownOptionId, labelFor } from "./options";
import type {
  JevAskInput,
  JevDecisionResult,
  JevDecisionsResponse,
  RankedOutcome,
} from "./types";
import { JevRequestError } from "./types";

const OPENROUTER_DECISIONS_URL = "https://openrouter.ai/api/alpha/decisions";
const JEV_MODEL = "typesafe/jev-1.13";
const MAX_CONTEXT_CHARS = 8000;

function buildRanked(probabilities: Record<string, number>): RankedOutcome[] {
  return Object.entries(probabilities)
    .map(([id, probability]) => ({
      id,
      label: labelFor(id),
      probability: typeof probability === "number" ? probability : 0,
    }))
    .sort((a, b) => b.probability - a.probability);
}

function resolveChoiceId(
  choice: string,
  ranked: RankedOutcome[]
): string {
  if (isKnownOptionId(choice)) {
    return choice;
  }
  const fromArgmax = ranked.find((r) => isKnownOptionId(r.id));
  if (fromArgmax) {
    return fromArgmax.id;
  }
  throw new JevRequestError(
    "Jev returned an unrecognized choice with no known probabilities.",
    null
  );
}

function parseOpenRouterError(body: unknown, status: number): JevRequestError {
  if (body && typeof body === "object") {
    const err = (body as { error?: { message?: string; code?: number | string } })
      .error;
    if (err?.message) {
      return new JevRequestError(err.message, status);
    }
  }
  return new JevRequestError(`OpenRouter request failed (${status})`, status);
}

export async function askJevEightBall(
  apiKey: string,
  input: JevAskInput
): Promise<JevDecisionResult> {
  const state: Record<string, string> = {
    question: input.question.trim(),
  };
  if (input.sourceUrl) {
    state.source_url = input.sourceUrl;
  }
  if (input.context) {
    state.context = input.context.slice(0, MAX_CONTEXT_CHARS);
  }

  const body = {
    model: JEV_MODEL,
    state,
    questions: {
      eightball: {
        type: "choice" as const,
        instructions:
          "Pick the single classic Magic 8-ball reply that best answers the user's yes/no-style question. Use only the closed set in criteria.",
        criteria: criteriaMap(),
      },
    },
  };

  let response: Response;
  try {
    response = await fetch(OPENROUTER_DECISIONS_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined" ? window.location.origin : "https://jev-8-ball.app",
        "X-OpenRouter-Title": "Jev 8 Ball",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new JevRequestError(
      "Could not reach OpenRouter. Check your network or CORS settings.",
      null
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new JevRequestError(
      "OpenRouter returned a non-JSON response.",
      response.status
    );
  }

  if (!response.ok) {
    throw parseOpenRouterError(payload, response.status);
  }

  const data = payload as JevDecisionsResponse;
  const answer = data?.answers?.eightball;
  if (!answer || answer.type !== "choice" || !answer.probabilities) {
    throw new JevRequestError(
      "Malformed Jev response: missing eightball choice answer.",
      response.status
    );
  }

  const ranked = buildRanked(answer.probabilities);
  if (ranked.length === 0) {
    throw new JevRequestError(
      "Jev returned an empty probability distribution.",
      response.status
    );
  }

  const choiceId = resolveChoiceId(answer.choice, ranked);
  const alternatives = ranked
    .filter((r) => r.id !== choiceId)
    .slice(0, 5);

  return {
    choiceId,
    phrase: labelFor(choiceId),
    confidence:
      typeof answer.confidence === "number" ? answer.confidence : 0,
    ranked,
    alternatives,
    usage: data.usage,
    rawModel: data.model ?? JEV_MODEL,
  };
}

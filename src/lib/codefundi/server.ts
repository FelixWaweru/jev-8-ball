import {
  CODEFUNDI_BASE_URL,
  type BlueprintResponse,
  type IndexRepoRequest,
  type IndexRepoResponse,
  type RepoBlueprint,
  type RepositoryIndexInitRepo,
} from "./types";

function getApiKey(): string {
  const key = process.env.CODEFUNDI_API_KEY;
  if (!key) {
    throw new Error("CODEFUNDI_API_KEY is not configured on the server.");
  }
  return key;
}

function encodeRepoKey(url: string): string {
  return encodeURIComponent(url);
}

async function codefundiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${CODEFUNDI_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as T | null;

  if (!res.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : `CodeFundi request failed (${res.status})`;
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return body as T;
}

/**
 * Fetch an existing repo blueprint. Returns null on 404/400 (not indexed yet).
 */
export async function getRepoBlueprint(
  url: string
): Promise<RepoBlueprint | null> {
  try {
    const segment = encodeRepoKey(url);
    const result = await codefundiFetch<BlueprintResponse | RepoBlueprint>(
      `/v2/repos/${segment}/blueprint`,
      { method: "GET" }
    );

    if (result && typeof result === "object" && "data" in result) {
      const envelope = result as BlueprintResponse;
      const data = envelope.data ?? null;
      if (!data) return null;
      // Codessey maps data string → readme fallback
      if (data.data && !data.readme) {
        return { ...data, readme: data.data };
      }
      return data;
    }

    return result as RepoBlueprint;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 400) {
      return null;
    }
    throw error;
  }
}

export async function indexRepo(
  request: IndexRepoRequest
): Promise<RepositoryIndexInitRepo> {
  const result = await codefundiFetch<IndexRepoResponse>(
    `/v2/repos/index/new`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  const repo = result.data?.repo;
  if (!repo) {
    throw new Error(result.message || "CodeFundi index returned no repo data.");
  }
  return repo;
}

import { NextResponse } from "next/server";
import { indexRepo } from "@/lib/codefundi/server";
import { indexRepoPayload, normalizeRepoUrl } from "@/lib/codefundi/repo-url";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === "string" ? body.url : "";
    if (!rawUrl.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const url = normalizeRepoUrl(rawUrl);
    const branch =
      typeof body?.branch === "string" ? body.branch : undefined;
    const index = await indexRepo(indexRepoPayload(url, branch));
    return NextResponse.json({ index });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Repo index failed";
    const status =
      typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

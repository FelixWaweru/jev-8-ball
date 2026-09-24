import { NextResponse } from "next/server";
import { getRepoBlueprint } from "@/lib/codefundi/server";
import { normalizeRepoUrl } from "@/lib/codefundi/repo-url";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === "string" ? body.url : "";
    if (!rawUrl.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const url = normalizeRepoUrl(rawUrl);
    const blueprint = await getRepoBlueprint(url);
    return NextResponse.json({ blueprint });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Blueprint lookup failed";
    const status =
      typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : 500;
    if (status === 404 || status === 400) {
      return NextResponse.json({ blueprint: null });
    }
    return NextResponse.json({ error: message }, { status });
  }
}

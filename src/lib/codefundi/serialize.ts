import type { RepoBlueprint, RepositoryIndexInitRepo } from "./types";

export function hasBlueprintPayload(
  blueprint: RepoBlueprint | null | undefined
): boolean {
  if (!blueprint) return false;
  if (blueprint.description) return true;
  if (blueprint.readme) return true;
  if (blueprint.data) return true;
  if (blueprint.languages != null) return true;
  if (blueprint.dependencies != null) return true;
  if (
    typeof blueprint.total_files === "number" ||
    typeof blueprint.file_count === "number"
  ) {
    return true;
  }
  if (
    Array.isArray(blueprint.conventions)
      ? blueprint.conventions.length > 0
      : Boolean(blueprint.conventions)
  ) {
    return true;
  }
  return false;
}

export function serializeRepoContext(input: {
  repoUrl: string;
  branch?: string;
  blueprint?: RepoBlueprint | null;
  index?: RepositoryIndexInitRepo | null;
}): string {
  const files = (input.index?.files?.index ?? [])
    .slice(0, 80)
    .map((f) => `${f.path}${f.language ? ` (${f.language})` : ""}`)
    .join("\n");

  const conventions = Array.isArray(input.blueprint?.conventions)
    ? input.blueprint!.conventions!.join("; ")
    : (input.blueprint?.conventions ?? "");

  const parts = [
    `Repository: ${input.repoUrl}`,
    `Branch: ${input.branch || input.index?.branch || input.blueprint?.branch || "default"}`,
    input.blueprint?.description &&
      `Description: ${input.blueprint.description}`,
    input.index?.description && `Index description: ${input.index.description}`,
    input.blueprint?.readme &&
      `README:\n${String(input.blueprint.readme).slice(0, 2500)}`,
    input.blueprint?.data &&
      `Blueprint data:\n${String(input.blueprint.data).slice(0, 2500)}`,
    conventions && `Conventions: ${conventions}`,
    input.blueprint?.dependencies != null &&
      `Dependencies: ${JSON.stringify(input.blueprint.dependencies).slice(0, 800)}`,
    input.blueprint?.languages != null &&
      `Languages: ${JSON.stringify(input.blueprint.languages)}`,
    `File count: ${
      input.index?.total_files ??
      input.blueprint?.total_files ??
      input.blueprint?.file_count ??
      "unknown"
    }`,
    files && `File index (sample):\n${files}`,
  ].filter(Boolean);

  return parts.join("\n\n").slice(0, 8000);
}

/**
 * Parse owner/repo from a GitHub URL or shorthand.
 */
export function parseGithubOwnerRepo(
  input: string
): { owner: string; name: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const shorthand = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/?$/);
  if (shorthand) {
    return { owner: shorthand[1], name: shorthand[2].replace(/\.git$/, "") };
  }

  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProto);
    if (!/github\.com$/i.test(url.hostname.replace(/^www\./, ""))) {
      return null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return {
      owner: parts[0],
      name: parts[1].replace(/\.git$/, ""),
    };
  } catch {
    return null;
  }
}

export function normalizeRepoUrl(input: string): string {
  const parsed = parseGithubOwnerRepo(input);
  if (parsed) {
    return `https://github.com/${parsed.owner}/${parsed.name}`;
  }
  return input.trim();
}

export function indexRepoPayload(
  url: string,
  branch?: string
): { url: string; branch?: string } {
  const payload: { url: string; branch?: string } = { url };
  const trimmed = branch?.trim();
  if (trimmed) {
    payload.branch = trimmed;
  }
  return payload;
}

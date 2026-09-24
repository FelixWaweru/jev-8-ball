export const CODEFUNDI_BASE_URL = "https://api.codefundi.app";

export interface RepoBlueprint {
  url?: string | null;
  branch?: string | null;
  description?: string | null;
  readme?: string | null;
  conventions?: string | string[] | null;
  dependencies?: unknown;
  languages?: unknown;
  total_files?: number | null;
  file_count?: number | null;
  data?: string | null;
}

export interface RepoIndexFileEntry {
  path: string;
  name: string;
  ext?: string | null;
  language?: string | null;
  sizeBytes?: number | null;
  modifiedAt?: string | null;
}

export interface RepositoryIndexInitRepo {
  url: string;
  branch: string | null;
  data_source_id: string | null;
  total_files: number | null;
  description: string | null;
  files: {
    tree: Record<string, unknown> | null;
    index: RepoIndexFileEntry[];
  };
}

export interface BaseResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export type BlueprintResponse = BaseResponse<RepoBlueprint>;
export type IndexRepoResponse = BaseResponse<{ repo: RepositoryIndexInitRepo }>;

export interface IndexRepoRequest {
  url: string;
  branch?: string;
  update?: boolean;
}

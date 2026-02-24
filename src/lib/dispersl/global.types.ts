/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DisperslConfig {
    baseUrl: string;
    apiKey: string;
}

export interface StatsResponse {
    [key: string]: any;
}

export interface PaginationInfo {
    limit?: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextToken?: string | null;
    prevToken?: string | null;
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
}

export interface PaginatedResponse<T> {
    status?: string;
    message?: string;
    data?: T[];
    agents?: T[];
    pagination: PaginationInfo;
}

export interface Agent {
    id: string;
    name_id: string;
    name: string;
    description: string;
    prompt: string;
    createdAt: string;
    createdBy: string;
    rating: number;
    image_url?: string;
    models: string[];
    mcpServers: any[];
    category?: string;
    availability: 'public' | 'private';
    isStarred: boolean;
    starsCount: number;
    cloneCount: number;
}

export interface AgentsResponse {
    agents: Agent[];
}

export interface TrendingAgentsResponse {
    agents: Agent[];
    pagination: PaginationInfo;
}

export interface Task {
    description: string;
    task_id: string;
    created_at: string;
    [key: string]: any;
}

export interface Step {
    id: string;
    [key: string]: any;
}

export interface TaskHistoryItem {
    id: string;
    [key: string]: any;
}

export interface StepHistoryItem {
    id: string;
    [key: string]: any;
}

export interface NDJSONChunk {
    status?: string;
    message?: string;
    content?: string;
    tools?: any[];
    [key: string]: any;
}

export type ChatRequest = any;
export type DisperseRequest = any;
export type BuildRequest = any;
export type RepoDocsRequest = any;
export type ModelsResponse = any;
export type APIKeysResponse = any;
export type NewAPIKeyResponse = any;
export type TaskResponse = any;
export type StepResponse = any;
export type HistoryResponse = any;
export type TaskHistoryResponse = any;
export type StepHistoryResponse = any;
export type HistoryEvent = any;

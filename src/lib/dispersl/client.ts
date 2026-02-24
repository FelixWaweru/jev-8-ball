/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DisperslConfig, StatsResponse, NDJSONChunk, ChatRequest, DisperseRequest, BuildRequest, RepoDocsRequest, ModelsResponse, APIKeysResponse, NewAPIKeyResponse, TaskResponse, StepResponse, HistoryResponse, Agent, AgentsResponse, TrendingAgentsResponse, PaginatedResponse, PaginationInfo, Task, Step, HistoryEvent, TaskHistoryResponse, StepHistoryResponse, StepHistoryItem, TaskHistoryItem } from './global.types';

export class DispersalAPIClient {
    private readonly config: DisperslConfig;

    constructor(config: DisperslConfig) {
        this.config = config;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        isStreaming = false
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        if (isStreaming) {
            return response.body as T;
        }

        return response.json() as Promise<T>;
    }

    // --- Analytics Endpoints ---
    async getUsageStats(range?: string | number): Promise<StatsResponse> {
        const r = range ?? 1;
        return this.makeRequest<StatsResponse>(`/stats/usage/${r}`, { method: 'GET' });
    }

    async getLanguageStats(range?: string | number): Promise<StatsResponse> {
        const r = range ?? 1;
        return this.makeRequest<StatsResponse>(`/stats/language/${r}`, { method: 'GET' });
    }

    async getAgentStats(range?: string | number): Promise<StatsResponse> {
        const r = range ?? 1;
        return this.makeRequest<StatsResponse>(`/stats/agent/${r}`, { method: 'GET' });
    }

    // --- Model Endpoints ---
    async getModels(): Promise<ModelsResponse> {
        return this.makeRequest<ModelsResponse>('/models');
    }

    // --- Agents ---
    async getAgents(limit: number = 20, nextToken?: string | null): Promise<PaginatedResponse<Agent>> {
        let url = `/agents?limit=${limit}`;
        if (nextToken) {
            url += `&nextToken=${encodeURIComponent(nextToken)}`;
        }

        const response = await this.makeRequest<{
            status: string;
            message: string;
            data: Array<{
                id: string;
                name_id: string;
                name: string;
                description: string;
                prompt: string;
                created_by: string;
                model: string;
                mcp_servers: Array<{
                    id: string;
                    name: string;
                    config: {
                        command: string;
                        args: string[];
                        env?: Record<string, string>;
                    };
                    source: string;
                    created_at: string;
                    updated_at: string;
                }>;
                category: string | null;
                created_at: string;
                stars_count: number;
                clone_count: number;
            }>;
            pagination: PaginationInfo;
        }>(url, { method: 'GET' });

        // Transform the response to match the expected Agent interface
        const agents: Agent[] = (response.data || []).map(agent => ({
            id: agent.id,
            name: agent.name,
            name_id: agent.name_id,
            description: agent.description,
            createdAt: agent.created_at || new Date().toISOString(),
            createdBy: agent.created_by,
            rating: 0, // API doesn't provide this, using default
            image_url: undefined, // API doesn't provide this
            models: agent.model ? [agent.model] : [],
            mcpServers: (agent.mcp_servers || []) as any,
            category: agent.category || undefined,
            availability: 'public' as const,
            isStarred: false, // Will be set by the UI based on user's starred agents
            starsCount: agent.stars_count,
            cloneCount: agent.clone_count,
            prompt: agent.prompt // Include prompt field
        }));

        return {
            status: response.status,
            message: response.message,
            data: agents,
            pagination: response.pagination
        };
    }

    // Legacy method for backward compatibility
    async getAgentsLegacy(): Promise<AgentsResponse> {
        const response = await this.getAgents(20);
        return {
            agents: response.data || []
        };
    }

    async getAgentById(id: string): Promise<Agent> {
        const response = await this.makeRequest<{
            status: string;
            message: string;
            data: {
                id: string;
                name_id: string;
                name: string;
                description: string;
                prompt: string;
                created_by: string;
                model: string;
                mcp_servers: string[];
                category: string | null;
                stars_count: number;
                clone_count: number;
            };
        }>(`/agents/${id}`, { method: 'GET' });

        // Transform the response to match the expected Agent interface
        const agent = response.data;
        return {
            id: agent.id,
            name: agent.name,
            name_id: agent.name_id,
            description: agent.description,
            prompt: agent.prompt, // Include prompt field
            createdAt: new Date().toISOString(), // API doesn't provide this, using current time
            createdBy: agent.created_by,
            rating: 0, // API doesn't provide this, using default
            image_url: undefined, // API doesn't provide this
            models: agent.model ? [agent.model] : [],
            mcpServers: (agent.mcp_servers || []) as any,
            category: agent.category || undefined,
            availability: 'public' as const,
            isStarred: false, // Will be set by the UI based on user's starred agents
            starsCount: agent.stars_count,
            cloneCount: agent.clone_count
        };
    }

    async getTaskById(id: string): Promise<Task> {
        const response = await this.makeRequest<{
            status: string;
            message: string;
            data: {
                description: string;
                task_id: string;
                created_at: string;
            };
        }>(`/tasks/${id}`, { method: 'GET' });

        return response.data;
    }

    async getTrendingAgents(page: number = 1, pageSize: number = 3): Promise<TrendingAgentsResponse> {
        // Dummy trending agents data with pagination
        const dummyTrending: Agent[] = [
            {
                id: 't1',
                name_id: 'code-reviewer',
                name: 'Code Reviewer',
                description: 'AI-powered code review agent',
                createdAt: new Date().toISOString(),
                createdBy: 'alice',
                rating: 4.9,
                image_url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MDA5MDJ8MHwxfHNlYXJjaHwxfHxwYWludGluZ3xlbnwwfHx8fDE3NTcwOTQ3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                models: ['gpt-4'],
                mcpServers: ['github', 'code-review-tools'] as any,
                prompt: 'You are a code reviewer.',
                availability: 'public',
                isStarred: false,
                starsCount: 100,
                cloneCount: 50
            },
            {
                id: 't2',
                name_id: 'security-scanner',
                name: 'Security Scanner',
                description: 'Automated security vulnerability detection',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                createdBy: 'bob',
                rating: 4.7,
                image_url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MDA5MDJ8MHwxfHNlYXJjaHwxfHxwYWludGluZ3xlbnwwfHx8fDE3NTcwOTQ3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                models: ['claude-3-haiku'],
                mcpServers: ['security-scanner', 'vulnerability-db'] as any,
                prompt: 'You are a security scanner.',
                availability: 'public',
                isStarred: false,
                starsCount: 80,
                cloneCount: 30
            },
            {
                id: 't3',
                name_id: 'test-generator',
                name: 'Test Generator',
                description: 'Generates comprehensive test suites',
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                createdBy: 'carol',
                rating: 4.6,
                image_url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MDA5MDJ8MHwxfHNlYXJjaHwxfHxwYWludGluZ3xlbnwwfHx8fDE3NTcwOTQ3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                models: ['gpt-3.5-turbo'],
                mcpServers: ['test-framework', 'coverage-tools'] as any,
                prompt: 'You are a test generator.',
                availability: 'public',
                isStarred: false,
                starsCount: 70,
                cloneCount: 20
            },
            {
                id: 't4',
                name_id: 'documentation-writer',
                name: 'Documentation Writer',
                description: 'Auto-generates technical documentation',
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                createdBy: 'dave',
                rating: 4.5,
                image_url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MDA5MDJ8MHwxfHNlYXJjaHwxfHxwYWludGluZ3xlbnwwfHx8fDE3NTcwOTQ3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                models: ['claude-3-opus'],
                mcpServers: ['markdown-tools', 'api-docs'] as any,
                prompt: 'You are a technical documentation writer.',
                availability: 'public',
                isStarred: false,
                starsCount: 60,
                cloneCount: 10
            },
            {
                id: 't5',
                name_id: 'performance-monitor',
                name: 'Performance Monitor',
                description: 'Monitors app performance and suggests optimizations',
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
                createdBy: 'eve',
                rating: 4.4,
                image_url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MDA5MDJ8MHwxfHNlYXJjaHwxfHxwYWludGluZ3xlbnwwfHx8fDE3NTcwOTQ3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                models: ['gpt-3.5-turbo'],
                mcpServers: ['performance-metrics', 'optimization-tools'] as any,
                prompt: 'You are a performance monitor.',
                availability: 'public',
                isStarred: false,
                starsCount: 50,
                cloneCount: 5
            },
        ];

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const agents = dummyTrending.slice(startIndex, endIndex);
        const totalPages = Math.ceil(dummyTrending.length / pageSize);

        return Promise.resolve({
            agents,
            pagination: {
                page: page,
                pageSize,
                total: dummyTrending.length,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    }

    // --- Paginated Endpoints ---

    // Get all tasks with token-based pagination
    async getTasks(limit: number = 20, nextToken?: string | null): Promise<PaginatedResponse<Task>> {
        let url = `/tasks?limit=${limit}`;
        if (nextToken) {
            url += `&nextToken=${encodeURIComponent(nextToken)}`;
        }
        return this.makeRequest<PaginatedResponse<Task>>(url, { method: 'GET' });
    }

    // Get steps by task ID with token-based pagination
    async getStepsByTaskId(taskId: string, limit: number = 20, nextToken?: string | null): Promise<PaginatedResponse<Step>> {
        let url = `/steps/task/${taskId}?limit=${limit}`;
        if (nextToken) {
            url += `&nextToken=${encodeURIComponent(nextToken)}`;
        }
        return this.makeRequest<PaginatedResponse<Step>>(url, { method: 'GET' });
    }

    // Get task history with token-based pagination
    async getTaskHistory(taskId: string, limit: number = 20, nextToken?: string | null, legacyLimit?: number): Promise<PaginatedResponse<TaskHistoryItem>> {
        let url = `/history/task/${taskId}?limit=${limit}`;
        if (nextToken) {
            url += `&nextToken=${encodeURIComponent(nextToken)}`;
        }

        const body = legacyLimit ? { limit: legacyLimit } : undefined;
        return this.makeRequest<PaginatedResponse<TaskHistoryItem>>(url, {
            method: 'GET',
            body: body ? JSON.stringify(body) : undefined
        });
    }

    async getStepHistory(stepId: string, limit: number = 20, nextToken?: string | null, legacyLimit?: number): Promise<PaginatedResponse<StepHistoryItem>> {
        let url = `/history/step/${stepId}?limit=${limit}`;
        if (nextToken) {
            url += `&nextToken=${encodeURIComponent(nextToken)}`;
        }

        const body = legacyLimit ? { limit: legacyLimit } : undefined;
        return this.makeRequest<PaginatedResponse<StepHistoryItem>>(url, {
            method: 'GET',
            body: body ? JSON.stringify(body) : undefined
        });
    }

    async executeAgent(
        nameId: string,
        prompt: string,
        options?: {
            model?: string;
            context?: string[];
            taskId?: string;
            knowledge?: string[];
            os?: string;
            defaultDir?: string;
            currentDir?: string;
            mcp?: Record<string, unknown>;
            onStream?: (chunk: any) => void;
        }
    ): Promise<ReadableStream<Uint8Array> | null> {
        const url = `/agent/completion`;
        const body = {
            name_id: nameId,
            prompt,
            model: options?.model,
            context: options?.context,
            task_id: options?.taskId,
            knowledge: options?.knowledge,
            os: options?.os || 'bash',
            default_dir: options?.defaultDir || './',
            current_dir: options?.currentDir || './',
            mcp: options?.mcp
        };

        try {
            const response = await fetch(`${this.config.baseUrl}${url}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            if (response.body) {
                return response.body;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    async executePlan(
        prompt: string,
        agentChoices: string[],
        options?: {
            model?: string;
            context?: string[];
            taskId?: string;
            knowledge?: string[];
            memory?: boolean;
            os?: string;
            defaultDir?: string;
            currentDir?: string;
            mcp?: Record<string, unknown>;
            onStream?: (chunk: any) => void;
        }
    ): Promise<ReadableStream<Uint8Array> | null> {
        const url = `/agent/plan`;
        const body = {
            prompt,
            agent_choice: agentChoices,
            model: options?.model,
            context: options?.context,
            task_id: options?.taskId,
            knowledge: options?.knowledge,
            memory: options?.memory,
            os: options?.os || 'bash',
            default_dir: options?.defaultDir || './',
            current_dir: options?.currentDir || './',
            mcp: options?.mcp
        };

        try {
            const response = await fetch(`${this.config.baseUrl}${url}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            if (response.body) {
                return response.body;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    async executeChat(
        prompt: string,
        options?: {
            model?: string;
            context?: string[];
            taskId?: string;
            knowledge?: string[];
            memory?: boolean;
            os?: string;
            defaultDir?: string;
            currentDir?: string;
            mcp?: Record<string, unknown>;
            onStream?: (chunk: any) => void;
        }
    ): Promise<ReadableStream<Uint8Array> | null> {
        const url = `/agent/chat`;
        const body = {
            prompt,
            model: options?.model,
            context: options?.context,
            task_id: options?.taskId,
            knowledge: options?.knowledge,
            memory: options?.memory,
            os: options?.os || 'bash',
            default_dir: options?.defaultDir || './',
            current_dir: options?.currentDir || './',
            mcp: options?.mcp
        };

        try {
            const response = await fetch(`${this.config.baseUrl}${url}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            if (response.body) {
                return response.body;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    async parseNDJSONStream(
        stream: ReadableStream<Uint8Array>,
        onChunk?: (data: any) => void
    ): Promise<void> {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (onChunk) onChunk(data);
                        } catch (e) {
                            console.warn('Failed to parse NDJSON line:', line);
                        }
                    }
                }
            }

            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    if (onChunk) onChunk(data);
                } catch (e) {
                    console.warn('Failed to parse remaining buffer:', buffer);
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // --- Pagination Helper Methods ---

    // Helper method to check if there's a next page
    hasNextPage(pagination: PaginationInfo): boolean {
        return pagination.hasNext;
    }

    // Helper method to check if there's a previous page
    hasPreviousPage(pagination: PaginationInfo): boolean {
        return pagination.hasPrev;
    }

    // Helper method to get the next token
    getNextToken(pagination: PaginationInfo): string | null {
        return pagination.nextToken;
    }

    // Helper method to get the previous token
    getPreviousToken(pagination: PaginationInfo): string | null {
        return pagination.prevToken;
    }

    // Helper method to validate limit
    validateLimit(limit: number): number {
        return Math.min(Math.max(limit, 1), 100);
    }

    // Helper method to create pagination state for client-side management
    createPaginationState(pagination: PaginationInfo) {
        return {
            limit: pagination.limit,
            hasNext: pagination.hasNext,
            hasPrev: pagination.hasPrev,
            nextToken: pagination.nextToken,
            prevToken: pagination.prevToken
        };
    }
}

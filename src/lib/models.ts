export interface AIModel {
    id: string; // Internal id for UI state
    name: string; // Display name
    modelId: string; // The literal model name used by Dispersal / OpenRouter API
    provider: string; // e.g. OpenAI, Anthropic, Google
    iconSvg: string; // SVG path or SVG string content
}

export const AI_MODELS: AIModel[] = [
    {
        id: "gpt-4o",
        name: "GPT-4o",
        modelId: "openai/gpt-4o-2024-11-20",
        provider: "OpenAI",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8 0-4.411 3.589-8 8-8 4.411 0 8 3.589 8 8 0 4.411-3.589 8-8 8zm4.496-10.464l-2.036 1.487c.28.601.442 1.258.442 1.942 0 2.228-1.579 4.106-3.701 4.385v-4.331l-2.035 1.488v2.45c-1.898-.558-3.32-2.316-3.32-4.411 0-.965.311-1.861.839-2.585l1.621 1.621c.075.05.155.092.241.124l1.455-1.455c-.211-.19-.444-.356-.694-.492l-1.332-1.332C8.616 8.529 9.255 8 10 8c1.332 0 2.628.71 3.32 1.838l1.411-1.031A5.952 5.952 0 0010 6c-3.111 0-5.69 2.378-5.968 5.437h2.003c.249-1.956 1.916-3.483 3.965-3.483.992 0 1.892.366 2.592.972l2.366-1.728a7.96 7.96 0 011.538 4.338z"/></svg>`
    },
    {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        modelId: "anthropic/claude-3-5-sonnet-20241022",
        provider: "Anthropic",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.42 3.59-8 8-8s8 3.58 8 8c0 4.41-3.59 8-8 8zm3.62-11.2h-7.3c-.62 0-1.12.5-1.12 1.11v4.44c0 .62.5 1.11 1.12 1.11h4.28l3.14 2v-3.11h.06c.62 0 1.12-.5 1.12-1.11V9.91c-.01-.61-.51-1.11-1.3-1.11zm-1.84 4.54H9.69v-.89h4.09v.89zm0-1.78H9.69v-.89h4.09v.89z"/></svg>`
    },
    {
        id: "gemini-1-5-pro",
        name: "Gemini 1.5 Pro",
        modelId: "google/gemini-pro-1.5",
        provider: "Google",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M21.5 11h-2V9h-2v2h-2v2h2v2h2v-2h2v-2zM9 13.5l1.5-3.5L14 8.5 10.5 7 9 3.5 7.5 7 4 8.5 7.5 10 9 13.5zM12.5 15l-1.5 3.5L9.5 15 6 13.5l3.5-1.5L11 8.5l1.5 3.5 3.5 1.5-3.5 1.5z"/></svg>`
    },
    {
        id: "llama-3-1",
        name: "Llama 3.1 70B",
        modelId: "meta-llama/llama-3.1-70b-instruct",
        provider: "Meta",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`
    },
    {
        id: "kimi-k2-5",
        name: "Kimi k2.5",
        modelId: "moonshotai/kimi-k2.5",
        provider: "Moonshot",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.42 3.59-8 8-8s8 3.58 8 8c0 4.41-3.59 8-8 8zm-2-5.5l5.5-3.5-5.5-3.5v7z"/></svg>`
    }
];

// Helper mapping to fake an Agent signature based on a Model
export const mapModelToAgent = (model: AIModel) => {
    return {
        id: `agent_${model.id}`,
        name_id: "magic-8-ball-voter", // Universal shared identity for the 8 ball planner logic
        name: model.name, // Display model name
        description: `Powered by ${model.provider}`,
        prompt: `You are an internal prediction unit powered by ${model.name}. Analyze the user's question, weigh outcomes purely from your model's independent perspective, and vote appropriately.`,
        models: [model.modelId], // Execute with this specific model
        createdAt: new Date().toISOString(),
        createdBy: "system",
        rating: 5,
        mcpServers: [],
        availability: "public" as const,
        isStarred: true,
        starsCount: 0,
        cloneCount: 0,
        // Hack: Append icon SVG as image_url for ui display if needed
        image_url: `data:image/svg+xml;base64,${typeof window !== 'undefined' ? btoa(model.iconSvg) : ''}`,
    };
};

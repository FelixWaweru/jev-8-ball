import { DispersalAPIClient } from "./client";
import { Agent } from "./global.types";
import { getMagic8BallMcpTools, MAGIC_8_BALL_OPTIONS } from "./mcp-tools";

export interface AgentResponse {
    agent: Agent;
    response: string;
    vote?: string;
    reasoning?: string;
}

export interface ConsensusResult {
    quickResponse: string;
    fullResponse: string;
    agentResponses: AgentResponse[];
}

export async function executeAgenticConsensus(
    apiKey: string,
    prompt: string,
    selectedAgents: Agent[],
    onProgress?: (agent: Agent, chunk: string) => void
): Promise<ConsensusResult> {
    const client = new DispersalAPIClient({
        baseUrl: process.env.NEXT_PUBLIC_DISPERSL_API_URL || "https://api.dispersl.com",
        apiKey,
    });

    const agentResponses: AgentResponse[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mcpTools = getMagic8BallMcpTools() as any;

    if (selectedAgents.length === 0) {
        return {
            quickResponse: "No agents selected.",
            fullResponse: "No agents were selected for consensus.",
            agentResponses: []
        };
    }

    const agentIds = selectedAgents.map(a => a.name_id);

    // 1. Construct the Master Plan Prompt
    let planPrompt = `You are the Lead Coordinator for a Magic 8 Ball prediction. Your goal is to orchestrate a comprehensive analysis of the user's inquiry.

SCENARIO/QUESTION:
${prompt}

EXECUTION PLAN:
You must utilize the provided agents to analyze this inquiry. 
The available agents are: ${selectedAgents.map(a => `${a.name} (${a.name_id})`).join(', ')}.

INSTRUCTIONS:
1. Determine the best order to consult the agents.
2. Handover to the first agent with specific instructions using the 'handover_task' tool.
3. Each agent MUST use the 'magic_8_ball_vote' tool to cast their vote and provide reasoning.
4. Continue handing over until all necessary analysis is complete.
5. End the session when finished using the 'end_session' tool.

AGENTS & THEIR IDENTITIES:
`;

    selectedAgents.forEach((agent) => {
        planPrompt += `
- ${agent.name} (${agent.name_id}):
${agent.prompt || 'Analyze the query from your unique perspective.'}
`;
    });

    const taskId = `vote-${Date.now()}`;
    let currentStep: 'plan' | 'agent' = 'plan';
    let currentAgentId: string | undefined;
    let currentPrompt = planPrompt;
    let loopActive = true;
    let loopCount = 0;
    const MAX_LOOPS = 20; // Safety break

    while (loopActive && loopCount < MAX_LOOPS) {
        loopCount++;
        let stream: ReadableStream<Uint8Array> | null = null;
        const activeAgentObj = currentAgentId ? selectedAgents.find(a => a.name_id === currentAgentId) : undefined;
        const fallbackModel = selectedAgents[0]?.models?.[0] || 'moonshotai/kimi-k2.5';
        const activeModel = activeAgentObj?.models?.[0] || fallbackModel;

        try {
            if (currentStep === 'plan') {
                stream = await client.executePlan(currentPrompt, agentIds, {
                    model: fallbackModel,
                    taskId,
                    mcp: mcpTools,
                });
            } else if (currentStep === 'agent' && currentAgentId) {
                stream = await client.executeAgent(currentAgentId, currentPrompt, {
                    model: activeModel,
                    taskId,
                    mcp: mcpTools,
                    os: 'bash',
                    defaultDir: './',
                    currentDir: './'
                });
            }

            if (!stream) {
                break;
            }

            let fullResponseText = '';
            let nextAction: { type: 'handover' | 'end' | 'none', toAgent?: string, prompt?: string } = { type: 'none' };
            let capturedVote: AgentResponse | null = null;

            await client.parseNDJSONStream(stream, async (chunk) => {
                // Content Processing
                if (chunk.status === 'processing' && (chunk.message === 'Content chunk' || chunk.message === 'Reasoning chunk')) {
                    if (chunk.content) {
                        fullResponseText += chunk.content;
                        if (onProgress && activeAgentObj) onProgress(activeAgentObj, chunk.content);
                    }
                } else if (chunk.content && !chunk.message) {
                    fullResponseText += chunk.content;
                    if (onProgress && activeAgentObj) onProgress(activeAgentObj, chunk.content);
                }

                // Tool Processing strictly based on MCP payload
                if (chunk.tools && Array.isArray(chunk.tools)) {
                    for (const t of chunk.tools) {
                        const toolName = t.function?.name;
                        const argsStr = t.function?.arguments || '{}';

                        try {
                            const args = JSON.parse(argsStr);
                            if (toolName === 'handover_task') {
                                const toAgent = args.agent_name || args.to_agent || args.name;
                                const promptStr = args.prompt || args.instructions || args.message;
                                nextAction = { type: 'handover', toAgent, prompt: promptStr };
                            } else if (toolName === 'end_session' || toolName === 'finish_task') {
                                nextAction = { type: 'end' };
                            } else if (toolName === 'magic_8_ball_vote') {
                                const voteIndex = typeof args.voteNumber === 'number' ? Math.max(0, Math.min(19, Math.floor(args.voteNumber))) : 0;
                                const reasoning = args.reasoning || "No reasoning provided.";
                                const votePhrase = MAGIC_8_BALL_OPTIONS[voteIndex];

                                if (activeAgentObj) {
                                    capturedVote = {
                                        agent: activeAgentObj,
                                        vote: votePhrase,
                                        reasoning: reasoning,
                                        response: `[Vote: ${votePhrase}] ${reasoning}`
                                    };
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse tool call arguments", e);
                        }
                    }
                }
            });

            // Fallback JSON parser if LLM didn't use explicit tool calls but output JSON
            if (!capturedVote && currentStep === 'agent' && activeAgentObj) {
                const jsonMatch = fullResponseText.match(/\{[\s\S]*?\}/g);
                if (jsonMatch) {
                    for (const match of jsonMatch) {
                        try {
                            const parsed = JSON.parse(match);
                            if (parsed.voteNumber !== undefined || parsed.reasoning) {
                                const vIndex = typeof parsed.voteNumber === 'number' ? Math.max(0, Math.min(19, Math.floor(parsed.voteNumber))) : 0;
                                const rReasoning = parsed.reasoning || "No reasoning structure.";
                                const votePhrase = MAGIC_8_BALL_OPTIONS[vIndex];
                                capturedVote = {
                                    agent: activeAgentObj,
                                    vote: votePhrase,
                                    reasoning: rReasoning,
                                    response: `[Vote: ${votePhrase}] ${rReasoning}`
                                };
                                break;
                            }
                        } catch { /* ignore */ }
                    }
                }

                // If STILL no vote, infer one or just attach response
                if (!capturedVote) {
                    capturedVote = {
                        agent: activeAgentObj,
                        vote: "Reply hazy, try again.",
                        reasoning: fullResponseText.trim(),
                        response: fullResponseText.trim()
                    };
                }
            }

            if (capturedVote) {
                agentResponses.push(capturedVote);
            }

            // Decide next step
            if (nextAction.type === 'handover' && nextAction.toAgent) {
                currentStep = 'agent';
                currentAgentId = nextAction.toAgent;
                currentPrompt = nextAction.prompt || `Proceed with your analysis for: ${prompt}`;
            } else if (nextAction.type === 'end') {
                loopActive = false;
            } else {
                // No valid handover or end, try to safely exit or continue fallback
                if (currentStep === 'plan') {
                    // Planner failed to handover, break loop.
                    loopActive = false;
                } else if (currentStep === 'agent') {
                    currentStep = 'plan';
                    currentAgentId = undefined;
                    currentPrompt = "Agent finished its task. Who is next? Handover to them using 'handover_task' or end the session if all agents are done using 'end_session'.";
                }
            }

        } catch (error) {
            console.error('Agentic Loop Error:', error);
            break; // Stop loop on fatal error
        }
    }

    if (agentResponses.length === 0) {
        return {
            quickResponse: "Reply hazy, try again.",
            fullResponse: "Agents were unable to formulate a response.",
            agentResponses: []
        };
    }

    const aggregatedFullResponse = agentResponses.map(ar => `### ${ar.agent.name}\n**Vote:** ${ar.vote}\n**Reasoning:** ${ar.reasoning}`).join('\n\n');

    let dominantVote = MAGIC_8_BALL_OPTIONS[0];
    const voteCounts: Record<string, number> = {};
    let maxCount = 0;

    agentResponses.forEach(ar => {
        if (ar.vote) {
            voteCounts[ar.vote] = (voteCounts[ar.vote] || 0) + 1;
            if (voteCounts[ar.vote] > maxCount) {
                maxCount = voteCounts[ar.vote];
                dominantVote = ar.vote;
            }
        }
    });

    return {
        quickResponse: dominantVote,
        fullResponse: aggregatedFullResponse,
        agentResponses,
    };
}

export const MAGIC_8_BALL_OPTIONS = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
];

export const getMagic8BallMcpTools = () => {
    return {
        tools: [
            {
                name: "magic_8_ball_vote",
                description: "Vote on the outcome of the user's question using standard Magic 8 Ball options.",
                inputSchema: {
                    type: "object",
                    properties: {
                        voteNumber: {
                            type: "number",
                            description: "Index of the specific Magic 8 Ball option (0 to 19)."
                        },
                        reasoning: {
                            type: "string",
                            description: "Very brief custom explanation for the choice."
                        }
                    },
                    required: ["voteNumber", "reasoning"]
                }
            },
            {
                name: "handover_task",
                description: "Handover execution to the next specialized agent to get their perspective.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agent_name: { "type": "string", description: "The name_id of the agent to handover to" },
                        prompt: { "type": "string", description: "Instructions for the next agent" }
                    },
                    required: ["agent_name", "prompt"]
                }
            },
            {
                name: "end_session",
                description: "End the agentic session once all required agents have submitted their vote.",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            }
        ]
    };
};

import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as Z from "zod";
import { searchInternet } from "./internet.service.js";

const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 30000;

const FALLBACK_RESPONSE_TEXT =
    "Sorry, I'm having trouble generating a response right now. Please try again in a moment.";

/**
 * Providers are tried in this order. Each one only gets added if its API key
 * is actually configured, so a missing key degrades the chain instead of
 * crashing the whole service at startup.
 */
function buildProviders() {
    const providers = [];

    if (process.env.OPENROUTER_API_KEY) {
        providers.push({
            name: "openrouter",
            model: new ChatOpenAI({
                model: process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash-vl:free",
                apiKey: process.env.OPENROUTER_API_KEY,
                configuration: {
                    baseURL: "https://openrouter.ai/api/v1",
                },
            }),
        });
    }

    if (process.env.GEMINI_API_KEY) {
        providers.push({
            name: "gemini",
            model: new ChatGoogleGenerativeAI({
                model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
                apiKey: process.env.GEMINI_API_KEY,
            }),
        });
    }

    if (process.env.MISTRAL_API_KEY) {
        providers.push({
            name: "mistral",
            model: new ChatMistralAI({
                model: process.env.MISTRAL_MODEL || "mistral-small-latest",
                apiKey: process.env.MISTRAL_API_KEY,
            }),
        });
    }

    if (providers.length === 0) {
        console.error(
            "ai.service: no AI provider API keys configured (OPENROUTER_API_KEY / GEMINI_API_KEY / MISTRAL_API_KEY). " +
            "AI responses will fail until at least one is set."
        );
    }

    return providers;
}

const providers = buildProviders();

const searchInternetTool = tool(searchInternet, {
    name: "search_internet",
    description:
        "Search the internet for up-to-date information. Use this when the user's question depends on current events, facts, or anything you might not know or might be out of date on.",
    schema: Z.object({
        query: Z.string().describe("The search query"),
    }),
})

// Agents are created lazily per-provider and cached, so a provider that's
// never needed (because earlier ones succeed) never pays agent setup cost.
const agentCache = new Map();

function getAgentForProvider(provider) {
    if (!agentCache.has(provider.name)) {
        agentCache.set(
            provider.name,
            createAgent({
                model: provider.model,
                tools: [searchInternetTool],
            })
        );
    }
    return agentCache.get(provider.name);
}

function withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const SYSTEM_PROMPT =
    "If you do not know the answer to something, or you are not fully sure, say that you don't know instead of guessing or making things up. " +
    "If the question depends on current events, recent facts, or anything that may have changed since your training, use the search_internet tool to find accurate information before answering.";

export async function generateResponse(history) {
    if (providers.length === 0) {
        return FALLBACK_RESPONSE_TEXT;
    }

    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...history.map((msg) =>
            msg.role === "user"
                ? new HumanMessage(msg.content)
                : new AIMessage(msg.content)
        ),
    ];

    let lastError = null;

    for (const provider of providers) {
        try {
            const agent = getAgentForProvider(provider);
            const result = await withTimeout(
                agent.invoke({ messages }),
                REQUEST_TIMEOUT_MS,
                `generateResponse (${provider.name})`
            );

            const lastMessage = result.messages[result.messages.length - 1];
            const text = lastMessage?.text?.trim();

            if (text) {
                return text;
            }

            lastError = new Error(`Provider "${provider.name}" returned an empty response`);
            console.error("generateResponse:", lastError.message);
        } catch (error) {
            lastError = error;
            console.error(`generateResponse: provider "${provider.name}" failed, trying next fallback if available`, error);
        }
    }

    console.error("generateResponse: all AI providers failed", lastError);
    return FALLBACK_RESPONSE_TEXT;
}

function fallbackTitleFromMessage(message) {
    const words = String(message || "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "New Chat";
    return words.slice(0, 5).join(" ");
}

export async function generateChatTitle(message) {
    if (providers.length === 0) {
        return fallbackTitleFromMessage(message);
    }

    const titleMessages = [
        new SystemMessage(
            "You generate concise and descriptive titles for chat conversations. " +
            "The user will provide the first message of the conversation. " +
            "Generate a clear, relevant, and engaging title that captures its main topic. " +
            "The title must contain 2 to 4 words. " +
            "Return only the title. Do not use quotes, punctuation, or explanations."
        ),
        new HumanMessage(message),
    ];

    for (const provider of providers) {
        try {
            const response = await withTimeout(
                provider.model.invoke(titleMessages),
                REQUEST_TIMEOUT_MS,
                `generateChatTitle (${provider.name})`
            );

            const title = response?.text?.trim();
            if (title) {
                return title;
            }
        } catch (error) {
            console.error(`generateChatTitle: provider "${provider.name}" failed, trying next fallback if available`, error);
        }
    }

    return fallbackTitleFromMessage(message);
}

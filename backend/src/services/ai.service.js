import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as Z from "zod";
import { searchInternet } from "./internet.service.js";

const openRouterModel = new ChatOpenAI({
    model: "inclusionai/ling-3.0-flash-vl:free",
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
});

const searchInternetTool = tool(searchInternet, {
    name: "search_internet",
    description:
        "Search the internet for up-to-date information. Use this when the user's question depends on current events, facts, or anything you might not know or might be out of date on.",
    schema: Z.object({
        query: Z.string().describe("The search query"),
    }),
})


const agent = createAgent({
    model: openRouterModel,
    tools: [searchInternetTool],
})

export async function generateResponse(history) {
    try {
        const result = await agent.invoke({
            messages: [
                new SystemMessage(
                    "If you do not know the answer to something, or you are not fully sure, say that you don't know instead of guessing or making things up. " +
                    "If the question depends on current events, recent facts, or anything that may have changed since your training, use the search_internet tool to find accurate information before answering."
                ),
                ...history.map((msg) =>
                    msg.role === "user"
                        ? new HumanMessage(msg.content)
                        : new AIMessage(msg.content)
                )
            ]
        });

        const lastMessage = result.messages[result.messages.length - 1];
        const text = lastMessage?.text?.trim();

        return text || "Sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
        console.error("generateResponse error:", error);
        return "Sorry, something went wrong while generating a response. Please try again.";
    }
}


export async function generateChatTitle(message) {
    const response = await openRouterModel.invoke([
        new SystemMessage(
            "You generate concise and descriptive titles for chat conversations. " +
            "The user will provide the first message of the conversation. " +
            "Generate a clear, relevant, and engaging title that captures its main topic. " +
            "The title must contain 2 to 4 words. " +
            "Return only the title. Do not use quotes, punctuation, or explanations."
        ),

        new HumanMessage(message)
    ]);

    return response.text.trim();
}
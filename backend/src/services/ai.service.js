import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-small-2603",
    apiKey: process.env.MISTRAL_API_KEY
})

export async function generateResponse(message) {
    const response = await geminiModel.invoke([
        new HumanMessage(message)
    ])

    return response.text;
}


export async function generateChatTitle(message) {
    const response = await mistralModel.invoke([
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
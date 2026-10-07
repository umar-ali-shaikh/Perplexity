import { tavily as Tavily } from "@tavily/core"

const tavily = process.env.TAVILY_API_KEY
    ? Tavily({ apiKey: process.env.TAVILY_API_KEY })
    : null;

export const searchInternet = async ({ query }) => {
    if (!tavily) {
        console.error("searchInternet: TAVILY_API_KEY is not configured, skipping search");
        return JSON.stringify({
            error: "Internet search is not available right now.",
        });
    }

    try {
        const results = await tavily.search(query, {
            maxResults: 5,
            searchDepth: "advanced"
        });

        return JSON.stringify(results);
    } catch (error) {
        console.error("searchInternet error:", error);
        return JSON.stringify({
            error: "Internet search failed. Answer using existing knowledge instead.",
        });
    }
}

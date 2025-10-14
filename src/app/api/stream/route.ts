import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
})
export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const result = streamText({
            model: google('models/gemini-2.5-flash'),
            prompt,
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error streaming text:", error);
        return new Response("Failed to stream text", { status: 500 });
    }
}
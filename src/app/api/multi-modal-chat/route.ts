import { streamText, UIMessage, convertToModelMessages } from "ai";
import { google } from "@/libs/googleAI";

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        const result = streamText({
            model: google("models/gemini-2.5-flash"),
            messages: convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error streaming chat completion:", error);
        return new Response("Failed to stream chat completion", { status: 500 });
    }
}
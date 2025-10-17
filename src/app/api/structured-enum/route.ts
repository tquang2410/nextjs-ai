import { generateObject } from "ai";
import { google } from "@/libs/googleAI";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        const result = await generateObject({
            model: google('models/gemini-2.5-pro'),
            output: "enum",
            enum: ["positive", "negative", "neutral"],
            prompt: `Classify the sentiment of the following text: "${text}"`,
        });
        return result.toJsonResponse();
    } catch (error) {
        console.error("Error generating structured enum data:", error);
        return new Response("Failed to generate structured enum data", { status: 500 });
    }
}
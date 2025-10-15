import { streamObject} from "ai";
import { google } from "@/libs/googleAI";
import {recipeSchema} from "@/app/api/structured-data/schema";

export async function POST(req: Request) {
    try {
        const {dish} = await req.json();
        const result = streamObject({
            model: google('models/gemini-2.5-flash'),
            schema: recipeSchema,
            prompt: `Provide a recipe for ${dish} `,
        })
        return result.toTextStreamResponse();
    }
    catch (error) {
        console.error("Error streaming structured data:", error);
        return new Response("Failed to stream structured data", {status: 500});
    }
}
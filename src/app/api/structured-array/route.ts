import { streamObject} from "ai";
import { google } from "@/libs/googleAI";
import { pokemonSchema} from "@/app/api/structured-array/schema";


export async function POST(req: Request) {
    try {
        const {type} = await req.json();
        const result = streamObject({
            model: google('models/gemini-2.5-flash'),
            output: "array",
            schema: pokemonSchema,
            prompt: `Provide a list of 5 ${type} type Pokémon .`,
        });
        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error streaming structured data:", error);
        return new Response("Failed to stream structured data", {status: 500});
    }
}
// import { GoogleGenAI } from "@google/genai";

import { generateText} from "ai";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
// import {openai} from "@ai-sdk/openai";
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
});
export async function POST(){
    const {text} = await generateText({
        model: google('models/gemini-2.5-flash'),
        prompt: "Write a poem about the sea in Vietnamese",
    });
    return Response.json({text});
}
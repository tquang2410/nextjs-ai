

import { generateText} from "ai";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
});
export async function POST(req: Request){
    try {
        const {prompt} = await req.json();
        const {text} = await generateText({
            // model: google('models/gemini-2.5-pro'),
            model: google('models/gemini-2.5-flash'),
            // prompt: prompt,
            // Rút gọn cú pháp nếu tên biến trùng với tên thuộc tính
            prompt,

        });
        return Response.json({text});
    } catch (error) {
        console.error("Error generating text", error);
        return Response.json({error: "Error generating text"}, {status: 500});
    }
}
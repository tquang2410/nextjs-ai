import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Khởi tạo và export instance của Google AI
export const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
});
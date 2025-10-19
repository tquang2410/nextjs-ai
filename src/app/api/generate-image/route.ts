// route.ts
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await ai.models.generateImages({
            model: "imagen-4.0-generate-001",
            prompt,
            config: {
                numberOfImages: 1,
            },
        });

        const generatedImage = response.generatedImages?.[0];

        if (!generatedImage?.image?.imageBytes) {
            throw new Error("No image generated");
        }

        const imageBytes = generatedImage.image.imageBytes;

        return Response.json(imageBytes);
    } catch (error) {
        console.error("Error generating image:", error);
        return new Response("Failed to generate image", { status: 500 });
    }
}
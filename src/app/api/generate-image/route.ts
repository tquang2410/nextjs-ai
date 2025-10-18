import { google } from "@ai-sdk/google";
import { experimental_generateImage as generateImage } from "ai";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const { image } = await generateImage({
            model: google.imageModel("imagen-3.0-generate-001"), // Model Imagen của Google
            prompt,
            size: "1024x1024",
            providerOptions: {
                google: {
                    personGeneration: "allow_all"
                },
            },
        });

        return Response.json(image.base64);
    } catch (error) {
        console.error("Error generating image:", error);
        return new Response("Failed to generate image", { status: 500 });
    }
}
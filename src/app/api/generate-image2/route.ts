// route.ts
import { HfInference } from "@huggingface/inference";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

        const blob = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: prompt,
        });

        // blob là Blob object, convert trực tiếp sang base64
        const arrayBuffer = await (blob as Blob).arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return Response.json(base64);
    } catch (error) {
        console.error("Error generating image:", error);
        return new Response("Failed to generate image", { status: 500 });
    }
}
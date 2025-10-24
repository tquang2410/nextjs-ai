import { GoogleGenAI, GroundingMetadata as GeminiGroundingMetadata } from "@google/genai";

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    groundingMetadata?: GeminiGroundingMetadata;
    timestamp: number;
};

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json();

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!
        });

        const groundingTool = {
            googleSearch: {},
        };

        const lastUserMessage = messages
            .filter(m => m.role === "user")
            .pop();

        if (!lastUserMessage) {
            return Response.json({ error: "No user message found" }, { status: 400 });
        }

        // GỌI API với await
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: lastUserMessage.content,
            config: {
                tools: [groundingTool],
            },
        });

        // LẤY TEXT từ response
        const text = response.text || "";
        const metadata = response.candidates?.[0]?.groundingMetadata;

        const assistantMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: text,
            groundingMetadata: metadata,
            timestamp: Date.now(),
        };

        return Response.json(assistantMessage);

    } catch (error) {
        console.error("Error calling Gemini API:", error);

        // LOG CHI TIẾT LỖI
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return Response.json(
            { error: "Failed to get response from Gemini", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
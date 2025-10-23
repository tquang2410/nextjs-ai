import { UIMessage,
    streamText,
    convertToModelMessages,
    tool,
    InferUITools,
    UIDataTypes,
    stepCountIs,
} from "ai";
import { google } from "@/libs/googleAI";
import { z } from "zod";

const tools = {
    getWeather: tool({
        description: "Get the current weather for a given location.",
        inputSchema: z.object({
            city: z.string().describe("The name of the city to get the weather for."),
        }),
        execute: async ({ city }) => {
            const response = await fetch(
                `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
            );
            const data = await response.json();
            const weatherData = {
                location: {
                    name: data.location.name,
                    country: data.location.country,
                    localtime: data.location.localtime,
                },
                current: {
                    temp_c: data.current.temp_c,
                    condition: {
                        text: data.current.condition.text,
                        code: data.current.condition.code,
                    },
                },
            };
            return weatherData;
        },
    }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

export async function POST(req: Request){
    try {
        const {messages}: { messages: ChatMessage[] } = await req.json(); // Đổi UIMessage[] thành ChatMessage[]
        const result = streamText({
            model: google('models/gemini-2.0-flash-exp'), // Dùng model mới hơn
            messages: convertToModelMessages(messages), // Bỏ system prompt
            tools,
            stopWhen: stepCountIs(2),
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error streaming text:", error);
        return new Response("Failed to stream text", { status: 500 });
    }
}
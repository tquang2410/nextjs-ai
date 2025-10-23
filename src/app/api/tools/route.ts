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
        execute: async ({city}) => {
            console.log("Weather tool called with city:", city);
            console.log("Type of city:", typeof city);
            console.log("City length:", city.length);

            // Chuẩn hóa về chữ thường để so sánh
            const cityLower = city.toLowerCase();

            if (cityLower === "gotham city") {
                return "The current weather in Gotham City is cloudy with a chance of bats.";
            } else if (cityLower === "metropolis") {
                return "The current weather in Metropolis is sunny with a high of 85°F.";
            } else {
                return `I'm sorry, I don't have weather data for ${city}.`;
            }
        },
    }),
};
export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>
export async function POST(req: Request){

    try {
        const {messages}: { messages: UIMessage[] } = await req.json();
        const result = streamText({
                model: google('models/gemini-2.5-flash'),
            // Chuyển đổi định dạng tin nhắn từ UI sang định dạng mà mô hình yêu cầu
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that provides concise and accurate information."
                    },
                    ...convertToModelMessages(messages)
                ],
                tools,
            stopWhen: stepCountIs(2) // Dừng sau 2 bước: AI nhận đầu vào là tên thành phố, sau đó gọi tool và trả về kết quả
            ,
            }
        );

        // Chuyển đổi kết quả sang định dạng phản hồi phù hợp với UI
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error streaming text:", error);
        return new Response("Failed to stream text", { status: 500 });
    }
}
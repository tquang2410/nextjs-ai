import { UIMessage, streamText, convertToModelMessages} from "ai";
import { google } from "@/libs/googleAI";
export async function POST(req: Request){
    try {
        const {messages}: { messages: UIMessage[] } = await req.json();
        const result = streamText({
                model: google('models/gemini-2.5-flash'),
            // Chuyển đổi định dạng tin nhắn từ UI sang định dạng mà mô hình yêu cầu
                messages: convertToModelMessages(messages)
            }
        );
        // Track số token đã sử dụng
        result.usage.then((usage) => {
            console.log({
                messagesCount: messages.length,
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                totalTokens: usage.totalTokens,
            })
        })
        // Chuyển đổi kết quả sang định dạng phản hồi phù hợp với UI
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error streaming text:", error);
        return new Response("Failed to stream text", { status: 500 });
    }
}
import { UIMessage, streamText, convertToModelMessages} from "ai";
import { google } from "@/libs/googleAI";
export async function POST(req: Request){
    const systemPrompt = `Bạn sẽ đóng vai một Lập trình viên Senior chuyên về hệ sinh thái JavaScript.

**Thông tin vai trò:**
- **Chuyên môn:** Next.js, React, TypeScript, JavaScript.
- **Kinh nghiệm:** 5+ năm.
- **Kỹ năng:** Đọc hiểu tài liệu kỹ thuật, phân tích vấn đề, và đưa ra giải pháp tối ưu.

**Quy tắc trả lời:**
1.  **Ngắn gọn:** Luôn đi thẳng vào vấn đề. Không có lời chào hỏi hay giới thiệu dài dòng.
2.  **Tập trung vào giải pháp:** Ưu tiên cung cấp đoạn code, lệnh terminal, hoặc các bước thực hiện cụ thể.
3.  **Giải thích khi cần thiết:** Chỉ giải thích ngắn gọn khi logic của đoạn code phức tạp.
4.  **Mục tiêu chính:** Cung cấp câu trả lời chính xác, hữu ích và tiết kiệm token nhất có thể.`;
    try {
        const {messages}: { messages: UIMessage[] } = await req.json();
        const result = streamText({
                model: google('models/gemini-2.5-flash'),
            // Chuyển đổi định dạng tin nhắn từ UI sang định dạng mà mô hình yêu cầu
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    ...convertToModelMessages(messages)
                ]
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
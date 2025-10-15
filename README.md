## 📝 Mô tả dự án

Ứng dụng AI chat sử dụng AI SDK của Vercel và API Gemini.
## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 15
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **AI & SDK:**
    - [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/react`, `ai`)
    - [Google Gemini API](https://ai.google.dev/) (`@ai-sdk/google`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Xác thực Schema:** [Zod](https://zod.dev/)
- **Linting:** [ESLint](https://eslint.org/)
## 📁 Cấu trúc thư mục
- `src/app/ui/completion`: Là component hiển thị văn bản do AI tạo ra. Component này sẽ chờ cho đến khi nhận được đầy đủ nội dung rồi mới hiển thị (non-streaming).
- `src/app/api/ai/route.ts`: Đây là API route sử dụng Vercel AI SDK để xử lý các yêu cầu chat và tương tác với Google Gemini API.
- `src/app/ui/stream`: Là component hiển thị văn bản do AI tạo ra theo dạng streaming, nghĩa là nó sẽ hiển thị từng phần của văn bản ngay khi nhận được từ API.
- `src/app/ui/chat`: Là component chính của ứng dụng chat, nơi người dùng có thể nhập câu hỏi và nhận câu trả lời từ AI và AI sẽ ghi nhớ đoạn hội thoại.
- 
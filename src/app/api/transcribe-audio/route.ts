import { GoogleGenAI } from "@google/genai";
export async function POST(req: Request)
{

    try {
        const formData = await req.formData()
        const audioFile = formData.get("audio") as File;
        if (!audioFile) {
            return new Response("Audio file is required", {status: 400});
        }
        // Chuyển định dạng sang base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");
        const ai = new GoogleGenAI({})
        const contents = [
            {
                // text: "Transcribe this audio file. Provide only the transcript text without any additional commentary." }, dùng cho model pro
                text: "Transcribe this audio file clearly and professionally. Format the text with proper punctuation and paragraphs."},
            {
                inlineData: {
                    mimeType: audioFile.type,
                    data: base64Audio,
                },
            },
        ];
        const response = await ai.models.generateContent({
            model: ("models/gemini-2.5-flash"),
            contents: contents,
        });
        const transcriptText = response.text;
        if (!transcriptText) {
            throw new Error("No transcript generated");
        }
        return Response.json({
            text: response.text.trim(),
        });
    } catch (error){
        console.error("Error during transcription:", error);
        return new Response("Failed to transcribe audio", {status: 500});
    }
}
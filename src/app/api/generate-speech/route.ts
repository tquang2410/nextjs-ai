import {GoogleGenAI} from '@google/genai';

// Định nghĩa interface cho response
interface InlineData {
    data: string;
    mimeType: string;
}

interface ContentPart {
    inlineData?: InlineData;
}

interface Content {
    parts?: ContentPart[];
}

interface Candidate {
    content?: Content;
}

interface GenerateContentResponse {
    candidates?: Candidate[];
}

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new Response('Text is required', { status: 400 });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Speak: ${text}` }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        }) as GenerateContentResponse;

        const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

        if (!audioPart?.data) {
            throw new Error("No audio data received from API");
        }

        const data: string = audioPart.data;
        const mimeType: string = audioPart.mimeType || "audio/wav";
        const audioBuffer = Buffer.from(data, 'base64');

        return new Response(audioBuffer, {
            headers: {
                "Content-Type": mimeType,
            },
        });

    } catch (error) {
        console.error('Error generating speech:', error);
        return new Response('Failed to generate speech', { status: 500 });
    }
}
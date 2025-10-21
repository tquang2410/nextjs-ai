import {GoogleGenAI} from '@google/genai';

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

// 🎯 Helper function để tạo WAV header
function createWavHeader(
    dataLength: number,
    sampleRate = 24000,
    channels = 1,
    bitsPerSample = 16
): Buffer {
    const byteRate = sampleRate * channels * (bitsPerSample / 8);
    const blockAlign = channels * (bitsPerSample / 8);
    const header = Buffer.alloc(44);

    // "RIFF" chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);

    // "fmt " sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size
    header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);

    // "data" sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);

    return header;
}

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new Response('Text is required', { status: 400 });
        }
        const ai = new GoogleGenAI({});

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

        // Decode base64 thành PCM data
        const pcmData = Buffer.from(audioPart.data, 'base64');

        // 🎯 Tạo WAV header và ghép với PCM data
        const wavHeader = createWavHeader(pcmData.length);
        const wavBuffer = Buffer.concat([wavHeader, pcmData]);

        console.log('✅ Audio converted to WAV:', {
            originalFormat: audioPart.mimeType,
            pcmSize: pcmData.length,
            wavSize: wavBuffer.length,
            outputFormat: 'audio/wav'
        });

        // Trả về WAV file thay vì raw PCM
        return new Response(wavBuffer, {
            headers: {
                "Content-Type": "audio/wav",
            },
        });

    } catch (error) {
        console.error('Error generating speech:', error);
        return new Response('Failed to generate speech', { status: 500 });
    }
}
"use client";

import { useState, useRef, useEffect } from "react";

export default function GenerateSpeechPage() {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAudio, setHasAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false); // Để theo dõi trạng thái phát âm thanh

    const audioUrlRef = useRef<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsLoading(true);
        setError(null);
        setText("");

        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }

        try {
            const response = await fetch("/api/generate-speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate audio");
            }

            const blob = await response.blob();
            // console.log('Blob info:', {
            //     type: blob.type,
            //     size: blob.size
            // });

            audioUrlRef.current = URL.createObjectURL(blob);
            // console.log('Audio URL:', audioUrlRef.current);
            audioRef.current = new Audio(audioUrlRef.current);

            // Cài đặt các sự kiện để theo dõi trạng thái phát âm thanh
            audioRef.current.addEventListener('play', () => setIsPlaying(true));
            audioRef.current.addEventListener('pause', () => setIsPlaying(false));
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));

            setHasAudio(true);
            audioRef.current.play();
        } catch (error) {
            console.error("Error generating audio:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
            setHasAudio(false);
        } finally {
            setIsLoading(false);
        }
    };

    const replayAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };
    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
    useEffect(() => {
        return () => {
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {error && <div className="text-red-500 mb-4">{error}</div>}

            {isLoading && <div className="text-center mb-4">Generating audio...</div>}

            {isPlaying && (
                <div className="mb-6 flex items-center justify-center gap-1 h-16">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-blue-500 rounded-full animate-wave"
                            style={{
                                animationDelay: `${i * 0.05}s`,
                                height: '100%'
                            }}
                        />
                    ))}
                </div>
            )}

            {/*{hasAudio && !isLoading && (*/}
            {/*    <button*/}
            {/*        onClick={replayAudio}*/}
            {/*        className="mb-4 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"*/}
            {/*    >*/}
            {/*        Replay Audio*/}
            {/*    </button>*/}
            {/*)}*/}
            {hasAudio && !isLoading && (
                <div>
                    {isPlaying
                        ? (
                        <button onClick={pauseAudio}
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                        > ⏸ Pause </button>
                    )
                        : (
                            <button
                                onClick={replayAudio}
                                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                ▶ Replay Audio
                            </button>
                        )
                    }

                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
            >
                <div className="flex gap-2">
                    <input
                        className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
                        placeholder="Enter text to convert to speech"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !text.trim()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate
                    </button>
                </div>
            </form>
        </div>
    );
}
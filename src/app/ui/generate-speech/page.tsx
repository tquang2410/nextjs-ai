"use client";
import React, { useState } from "react";
export default function GenerateSpeechPage() {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAudio, setHasAudio] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>)=> {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setText("");
        try {
            const response = await fetch("/api/generate-speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            })
            if (!response.ok) {
                throw new Error("Failed to generate speech");
            }
        } catch (error){
            console.error("Error generating speech:", error);
            setError(error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."
            );
            setHasAudio(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {/*Audio UI */}
            <form
                onSubmit={handleSubmit}
                className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg">
                <div className="flex gap-2">
                    {/*Text input here*/}
                    <input
                        className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit"
                        disabled={isLoading || !text}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate Speech
                    </button>
                </div>
            </form>
        </div>
    );
}
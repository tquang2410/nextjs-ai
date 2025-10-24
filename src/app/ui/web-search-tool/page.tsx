"use client";

import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/app/api/web-search-tool/route";

export default function WebSearchToolPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/web-search-tool", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const assistantMessage: ChatMessage = await response.json();

            setMessages((prev) => [...prev, assistantMessage]);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-3xl py-24 mx-auto stretch px-4">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                        ❌ Error: {error}
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div className="space-y-4 mb-24">
                {messages.map((message) => (
                    <div key={message.id} className="mb-6">
                        {/* Message Header */}
                        <div className="font-semibold text-sm mb-2 text-zinc-600 dark:text-zinc-400">
                            {message.role === "user" ? "You:" : "AI:"}
                        </div>

                        {/* Message Content */}
                        <div className="whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg text-zinc-900 dark:text-zinc-100 shadow-sm">
                            {message.content}
                        </div>

                        {/* Grounding Metadata - Only for Assistant Messages */}
                        {message.role === "assistant" && message.groundingMetadata && (
                            <div className="mt-4 space-y-3">

                                {/* Search Queries Section */}
                                {message.groundingMetadata.webSearchQueries &&
                                    message.groundingMetadata.webSearchQueries.length > 0 && (
                                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                <span>🔍</span>
                                                <span>Search Queries Used:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {message.groundingMetadata.webSearchQueries.map((query, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium"
                                                    >
                                                        {query}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {/* Sources Section */}
                                {message.groundingMetadata.groundingChunks &&
                                    message.groundingMetadata.groundingChunks.length > 0 && (
                                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                    📚 Sources ({message.groundingMetadata.groundingChunks.length})
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {message.groundingMetadata.groundingChunks.map((chunk, i) => {
                                                    if (chunk.web) {
                                                        return (
                                                            <a
                                                                key={i}
                                                                href={chunk.web.uri}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block group hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                            >
                                                                <div className="flex items-start gap-3 p-3">
                                                                    <span className="text-green-600 dark:text-green-400 font-mono text-xs flex-shrink-0 mt-0.5 font-semibold">
                                                                        [{i + 1}]
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-medium text-green-700 dark:text-green-300 group-hover:underline mb-1">
                                                                            {chunk.web.title || "Untitled"}
                                                                        </div>
                                                                        <div className="text-xs text-green-600/70 dark:text-green-400/70 truncate">
                                                                            {chunk.web.uri}
                                                                        </div>
                                                                    </div>
                                                                    <svg
                                                                        className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </div>
                                                            </a>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                {/* Citation Details Section */}
                                {message.groundingMetadata.groundingSupports &&
                                    message.groundingMetadata.groundingSupports.length > 0 && (
                                        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                                                <span>🔗</span>
                                                <span>Citation Details:</span>
                                            </div>
                                            <div className="space-y-2">
                                                {message.groundingMetadata.groundingSupports.map((support, i) => {
                                                    if (!support.segment || !support.groundingChunkIndices) return null;

                                                    return (
                                                        <div key={i} className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                            <div className="text-sm text-purple-700 dark:text-purple-300 mb-2 italic">
                                                                &quot;{support.segment.text}&quot;
                                                            </div>
                                                            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                                Referenced from sources: [{support.groundingChunkIndices.map(idx => idx + 1).join(", ")}]
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="mb-4">
                        <div className="font-semibold text-sm mb-2 text-zinc-600 dark:text-zinc-400">
                            AI:
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">Searching and thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Fixed at Bottom */}
            <form
                onSubmit={handleSubmit}
                className="fixed bottom-0 w-full max-w-3xl mx-auto left-0 right-0 p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
            >
                <div className="flex gap-2">
                    <input
                        className="flex-1 dark:bg-zinc-800 bg-white p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything... (I can search the web!)"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            </span>
                        ) : (
                            "Send"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

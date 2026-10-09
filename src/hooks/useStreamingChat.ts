import { useState, useRef, useCallback } from "react";

export interface Message {
    role: "system" | "user" | "assistant";
    content:
        | string
        | Array<{
              type: "text" | "image_url";
              text?: string;
              image_url?: { url: string };
          }>;
}

interface ChatCompletionParams {
    model: string;
    messages: Message[];
}

interface StreamChunk {
    choices?: Array<{
        delta: {
            content?: string;
        };
    }>;
}

export function useStreamingChat() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [output, setOutput] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    const streamChatCompletion = useCallback(
        async (
            params: ChatCompletionParams,
            onStream?: (chunk: string) => void,
        ) => {
            setIsLoading(true);
            setError(null);
            setOutput("");
            abortControllerRef.current = new AbortController();

            try {
                const response = await fetch("/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...params,
                        stream: true, // 启用流式输出
                    }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error("No response body");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedOutput = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk
                        .split("\n")
                        .filter((line) => line.trim() !== "");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.substring(6);
                            if (data === "[DONE]") {
                                break;
                            }

                            try {
                                const parsed: StreamChunk = JSON.parse(data);
                                const content =
                                    parsed.choices?.[0]?.delta?.content || "";
                                accumulatedOutput += content;
                                setOutput((prev) => prev + content);
                                onStream?.(content);
                            } catch (e) {
                                console.error("Error parsing chunk:", e);
                            }
                        }
                    }
                }

                return accumulatedOutput;
            } catch (error) {
                if (error instanceof Error && error.name !== "AbortError") {
                    setError(error.message);
                    console.error("Streaming error:", error);
                }
                return "";
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [],
    );

    const abortRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    }, []);

    return { streamChatCompletion, abortRequest, isLoading, error, output };
}

export const message2string = (msg: Message): string => {
    if (typeof msg.content === "string") return msg.content;
    const texts = msg.content.filter((item) => item.type === "text");
    return texts.map((item) => item.text).join("");
};

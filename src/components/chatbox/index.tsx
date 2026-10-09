import { FC, HTMLProps, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { Dialogues } from "./components/dialogues";
import { ChatBoxInput } from "./components/input";

import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Message, useStreamingChat } from "@/hooks/useStreamingChat";

export const ChatBox: FC<HTMLProps<HTMLDivElement>> = (props) => {
    const { className, ...rest } = props;
    const { streamChatCompletion, abortRequest, isLoading, error, output } =
        useStreamingChat();

    const [params, setParams] = useState<{
        model: string;
        messages: Message[];
    }>({
        model: "./Qwen2.5-VL-7B",
        messages: [
            {
                role: "system" as const,
                content: "You are a helpful assistant.",
            },
        ],
    });
    const containerRef = useAutoScroll(params);

    const handleSubmit = async (content: string) => {
        const newParam = {
            model: params.model,
            messages: [
                ...params.messages,
                {
                    role: "user" as const,
                    content: [
                        {
                            type: "text" as const,
                            text: content,
                        },
                    ],
                },
                {
                    role: "assistant" as const,
                    content: [
                        {
                            type: "text" as const,
                            text: "加载中",
                        },
                    ],
                },
            ],
        };
        setParams(newParam);
        await streamChatCompletion(newParam);
    };

    useEffect(() => {
        if (output.length > 0) {
            setParams((prev) => ({
                model: prev.model,
                messages: prev.messages.map((item, index) =>
                    index === prev.messages.length - 1
                        ? {
                              role: item.role,
                              content: [
                                  {
                                      type: "text" as const,
                                      text: output,
                                  },
                              ],
                          }
                        : item,
                ),
            }));
        }
    }, [output]);

    return (
        <div
            className={twMerge(
                "w-full flex justify-between flex-col h-full bg-[#eff6ff]",
                className,
            )}
            {...rest}
        >
            <div className="flex-1 px-5 overflow-scroll">
                <Dialogues messages={params.messages} ref={containerRef} />
            </div>
            <div className="px-2.5">
                <ChatBoxInput handleSubmit={handleSubmit} loading={isLoading} />
            </div>
        </div>
    );
};

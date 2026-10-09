import { FC, HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { Bubble } from "./bubble";

import { Message, message2string } from "@/hooks/useStreamingChat";

interface DialoguesProps extends HTMLProps<HTMLDivElement> {
    messages: Message[];
}

export const Dialogues: FC<DialoguesProps> = (props) => {
    const { messages, ...rest } = props;
    return (
        <div className="w-full h-full overflow-scroll" {...rest}>
            {messages.map(
                (msg, index) =>
                    msg.role !== "system" && (
                        <Bubble
                            role={msg.role}
                            key={`chat-box-msg-${index}`}
                            className={twMerge(
                                "mt-6",
                                index === messages.length - 1
                                    ? "mb-6"
                                    : "mb-1.5",
                            )}
                        >
                            {message2string(msg)}
                        </Bubble>
                    ),
            )}
        </div>
    );
};

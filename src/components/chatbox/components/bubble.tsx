import { FC, HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

interface BubbleProps extends HTMLProps<HTMLDivElement> {
    role: "user" | "assistant";
}

export const Bubble: FC<BubbleProps> = (props) => {
    const { role, className, children, ...rest } = props;
    return (
        <div
            className={twMerge(
                "flex items-center",
                role === "user" && "justify-end",
                role === "assistant" && "justify-start",
            )}
        >
            <div
                className={twMerge(
                    "rounded-2xl px-4 py-2.5 whitespace-pre-wrap",
                    role === "user" &&
                        "rounded-br-xs ml-2 text-white bg-[linear-gradient(90deg,#A48DFF_0%,#717FFF_100%)]",
                    role === "assistant" && "rounded-bl-xs mr-2 bg-white",
                    className,
                )}
                {...rest}
            >
                {children}
            </div>
        </div>
    );
};

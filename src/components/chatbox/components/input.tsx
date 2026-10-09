import { FC, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { IconSend } from "@/assets/svg";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface ChatBoxInputProps {
    handleSubmit: (content: string) => Promise<void>;
    loading: boolean;
}

export const ChatBoxInput: FC<ChatBoxInputProps> = ({
    handleSubmit,
    loading,
}) => {
    const [content, setContent] = useState<string>("");
    const divRef = useRef<HTMLDivElement>(null);
    const forbid = loading || content.trim().length === 0;

    useEffect(() => {
        if (divRef.current && divRef.current.textContent !== content) {
            divRef.current.textContent = content;
            const range = document.createRange();
            range.selectNodeContents(divRef.current);
            range.collapse(false);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [content]);

    const containerRef = useAutoScroll(content);
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStart(textNode, text.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        if (divRef.current !== null) {
            const inputEvent = new Event("input", { bubbles: true });
            divRef.current.dispatchEvent(inputEvent);
        }
    };

    const handleInput = () => {
        if (divRef.current) {
            const newContent = divRef.current.textContent || "";
            setContent(newContent);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            if (!divRef.current) return;

            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            setContent((prev) =>
                prev.endsWith("\n") ? prev + "\n" : prev + "\n\n",
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (forbid) return;
            handleSubmit(content.trim());
            setContent("");
        }
    };

    return (
        <div className="w-full max-h-[200px] min-h-[100px] border-2 border-blue-1 border-solid rounded-[15px] mb-5 pl-2.5 pr-2 flex justify-between flex-col bg-white">
            <div className="max-h-[126px] overflow-y-scroll" ref={containerRef}>
                <div
                    contentEditable
                    className="w-full box-border px-2 pt-[15px] pb-1.5 outline-0 text-sm text-wrap whitespace-pre-wrap"
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    ref={divRef}
                    onInput={handleInput}
                />
            </div>
            <div className="flex items-center justify-end pb-2">
                <IconSend
                    className={twMerge(
                        "cursor-pointer text-blue-1",
                        forbid
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:opacity-60",
                    )}
                    onClick={() => {
                        if (forbid) return;
                        handleSubmit(content.trim());
                        setContent("");
                    }}
                />
            </div>
        </div>
    );
};

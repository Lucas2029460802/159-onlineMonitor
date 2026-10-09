import { useRef, useEffect, useMemo } from "react";

import { IconAttatch, IconDeleteUpload, IconSearch } from "@/assets/svg";
import { $Rag, ResStatus } from "@/store/rag";

interface ChatInputProps {
    onSend: () => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewFiles = $Rag.use((r) => r.previewFiles);
    const imagePreviewUrls = useMemo(() => {
        const urls = previewFiles.map((f) => {
            console.log("Generating preview URL for file:", f);
            return URL.createObjectURL(f);
        });
        return urls;
    }, [previewFiles]);
    const searchText = $Rag.use((r) => r.searchText);
    const resStatus = $Rag.use((r) => r.resStatus);

    // 自动调节 textarea 高度
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 70)}px`;
        }
    }, [searchText]);

    // 图片上传处理
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            $Rag.update("upload file", (s) => {
                s.previewFiles = [...s.previewFiles, file];
            });
            e.target.value = ""; // 清除选择状态，允许再次选择相同文件
        } else {
            alert("目前先只允许图片");
        }
    };

    const searchDisabled = resStatus !== ResStatus.Idle || !searchText.trim();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea || searchDisabled) return;
        const handleEnter = (e: KeyboardEvent) => {
            console.log("keydown", e.key, e.shiftKey);
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
            }
        };
        textarea.addEventListener("keydown", handleEnter);
        return () => {
            textarea.removeEventListener("keydown", handleEnter);
        };
    }, [onSend, searchDisabled]);
    return (
        <div className="w-full p-4 pt-0 border border-[rgba(0,0,0,0.08)] rounded-2xl">
            <div className="flex-grow overflow-auto min-h-16 max-h-full  text-left">
                <div className="gap-5 flex">
                    {imagePreviewUrls.map((url, idx) => (
                        <div
                            className="h-14 mt-3 mb-1 relative overflow-visible inline-block group"
                            key={`${url.slice(0, 20)}-${url.slice(-20)}-${idx}`}
                        >
                            <img
                                src={url}
                                alt="preview"
                                className="h-full rounded-[8px]"
                            />
                            <button
                                onClick={() => {
                                    $Rag.update("remove preview file", (s) => {
                                        s.previewFiles = s.previewFiles.filter(
                                            (_, i) => i !== idx,
                                        );
                                    });
                                }}
                                className="w-4 h-4 absolute -top-2 left-[calc(100%-8px)]  opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                                <IconDeleteUpload />
                            </button>
                        </div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="请输入搜索内容..."
                    value={searchText}
                    onChange={(e) => {
                        $Rag.update("update search text", (r) => {
                            r.searchText = e.target.value;
                        });
                    }}
                    className="w-full resize-none rounded-xl p-2 focus:outline-none max-h-[240px] overflow-y-auto"
                    style={{
                        height: "auto",
                        marginTop: imagePreviewUrls.length === 0 ? 0 : 9,
                    }}
                />
            </div>

            {/* 上传图片用的隐藏 input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{
                    display: "none",
                }}
                onChange={handleImageUpload}
            />

            <div className="w-full h-9 flex justify-between mt-2">
                <button
                    id="chat-attach-file-btn"
                    className="w-9 h-9 border border-black/8 rounded-[10px] flex items-center justify-center transition hover:bg-[rgba(0,0,0,0.039)]"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        opacity: 0,
                        visibility: "hidden",
                    }}
                >
                    <IconAttatch />
                </button>

                <button
                    id="chat-send-btn"
                    disabled={searchDisabled}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition
                                ${
                                    !searchDisabled
                                        ? "bg-[#00AEEC] hover:bg-[#51a2ff] cursor-pointer"
                                        : "bg-[#d1d5dc] cursor-not-allowed"
                                }`}
                    onClick={() => {
                        if (searchDisabled) return;
                        // 等等写
                        onSend();
                    }}
                >
                    <span className="text-white text-sm ">
                        <IconSearch />
                    </span>
                </button>
            </div>
        </div>
    );
}

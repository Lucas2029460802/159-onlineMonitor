import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { IconAttatch, IconDeleteUpload, IconSearch } from "@/assets/svg";
import { $Search } from "@/store/search";
interface SearchBoxProps {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
}

export default function SearchBox({ text, setText }: SearchBoxProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { taskId } = useParams();

    const uploadedImage = $Search.use((s) => s.image);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    useEffect(() => {
        setImagePreviewUrl(
            uploadedImage ? URL.createObjectURL(uploadedImage) : null,
        );
    }, [uploadedImage]);
    const autoResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const newHeight = Math.min(textarea.scrollHeight, 70);
            textarea.style.height = `${newHeight}px`;
        }
    };

    useEffect(() => {
        autoResize();
    }, [text]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && text.trim()) {
                const paths = location.pathname.split("/");
                navigate(
                    `/${paths[1]}/${taskId}/new-bigpic?keywords=${text.trim()}&sort_field_id=1&order=1`,
                );
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            $Search.update("setimage", (s) => {
                s.image = file;
            });
            setImagePreviewUrl(URL.createObjectURL(file));
            // 在show-img里展示图片
            e.target.value = "";
        }
    };

    const [searchDisabled, setSearchDisabled] = useState(true);
    useEffect(() => {
        setSearchDisabled(
            !text.trim() &&
                (uploadedImage === null || imagePreviewUrl === null),
        );
    }, [imagePreviewUrl, text, uploadedImage]);

    return (
        <div className="w-full flex justify-center bg-transparent">
            <div className="w-full max-w-2xl  rounded-2xl  flex flex-col">
                <div className="mb-4 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-bold text-black mb-4">
                        你好，阿Sir
                    </h1>
                    <p className="text-sm text-gray-500">
                        用自然语言搜索语义最相关图片，让大模型检索回答
                    </p>
                </div>

                <div className="p-4 pt-0 border border-[rgba(0,0,0,0.08)] rounded-2xl">
                    <div className="flex-grow overflow-auto min-h-16 text-left">
                        {imagePreviewUrl && (
                            <div
                                className="h-14 mt-3 mb-1 relative overflow-visible inline-block group"
                                id="show-img"
                            >
                                <img
                                    src={imagePreviewUrl}
                                    alt="preview"
                                    className="h-full rounded-[8px]"
                                />
                                <button
                                    onClick={() => {
                                        setImagePreviewUrl(null);
                                        $Search.update("setimage", (s) => {
                                            s.image = null;
                                        });
                                    }}
                                    className="w-4 h-4 absolute -top-2 left-[calc(100%-8px)]  opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                    <IconDeleteUpload />
                                </button>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder="请输入搜索内容..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full resize-none rounded-xl p-2 focus:outline-none max-h-[240px] overflow-y-auto"
                            style={{
                                height: "auto",
                                marginTop: imagePreviewUrl ? 0 : 9,
                            }}
                        />
                    </div>

                    {/* 上传图片用的隐藏 input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                    />

                    <div className="w-full h-9 flex justify-between mt-2">
                        <button
                            className="w-9 h-9 border border-black/8 rounded-[10px] flex items-center justify-center transition hover:bg-[rgba(0,0,0,0.039)] cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <IconAttatch />
                        </button>

                        <button
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
                            }}
                        >
                            <span className="text-white text-sm">
                                <IconSearch />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

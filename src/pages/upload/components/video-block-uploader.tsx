import { FC, useRef } from "react";

import { IconAdd } from "@/assets/svg";

interface VideoBlockUploaderProps {
    onUpload?: (files: File[]) => void;
}

export const VideoBlockUploader: FC<VideoBlockUploaderProps> = ({
    onUpload,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        const validFiles = files.filter(
            (file) =>
                file.type.startsWith("video/") ||
                file.name.toLowerCase().endsWith(".flv") ||
                file.name.toLowerCase().endsWith(".dav"),
        );

        if (onUpload && validFiles.length === files.length) {
            onUpload(validFiles);
        }
    };

    return (
        <>
            <div
                className="w-[98px] h-15 text-xs rounded-lg bg-white flex flex-col items-center justify-center mb-2.5 text-text-1 select-none cursor-pointer"
                onClick={() => {
                    if (inputRef.current) {
                        inputRef.current.click();
                    }
                }}
            >
                <IconAdd className="text-xl" />
                <div>添加视频</div>
            </div>
            <input
                type="file"
                accept="video/*,.flv,.dav"
                onChange={handleFileSelect}
                multiple
                style={{ display: "none" }}
                ref={inputRef}
            />
        </>
    );
};

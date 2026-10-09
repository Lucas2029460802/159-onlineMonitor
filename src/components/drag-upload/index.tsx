import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

import { IconUpload } from "@/assets/svg";

type UploaderProps = {
    className?: string;
    onUpload: (files: File[]) => void;
};

export const Uploader: React.FC<UploaderProps> = ({ className, onUpload }) => {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        const validFiles = files.filter(
            (file) =>
                file.type.startsWith("video/") ||
                file.name.toLowerCase().endsWith(".flv") ||
                file.name.toLowerCase().endsWith(".dav"),
        );

        if (validFiles.length === files.length) {
            setError(null);
            onUpload(validFiles); // 传递多个文件
        } else {
            setError("请上传视频文件");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);

        const validFiles = files.filter(
            (file) =>
                file.type.startsWith("video/") ||
                file.name.toLowerCase().endsWith(".flv") ||
                file.name.toLowerCase().endsWith(".dav"),
        );

        if (validFiles.length === files.length) {
            setError(null);
            onUpload(validFiles); // 传递多个文件
        } else {
            setError("请上传视频文件");
        }
    };

    return (
        <div
            className={twMerge(
                "flex items-center flex-col justify-center",
                className,
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: dragging ? "2px dashed #007bff" : "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "8px",
            }}
        >
            <p>{dragging ? "放开鼠标上传视频" : "拖拽或点击上传视频"}</p>
            <input
                type="file"
                accept="video/*,.flv,.dav"
                onChange={handleFileSelect}
                multiple
                style={{ display: "none" }}
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                className="text-blue-1 flex flex-col items-center justify-center"
                style={{ cursor: "pointer" }}
            >
                <IconUpload className="text-3xl" />
                点击选择文件
            </label>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Uploader;

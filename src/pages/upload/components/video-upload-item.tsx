import { FC, Ref, useEffect, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { UploadFile } from "..";

import { IconClose, IconSuccess } from "@/assets/svg";
import { useUploadContext } from "@/hooks/useUploadContext";

export interface VideoUploadItemHandle {
    startUpload: () => void;
    pauseUpload: () => void;
    resetUpload: () => void;
    deleteUpload: () => void;
    doDelete: () => void;
    isFinished: () => boolean;
    isError: () => boolean;
    isUploading: () => boolean;
}

interface VideoUploadItemProps {
    selected?: boolean;
    file: UploadFile;
    onDelete?: () => void;
    onChange?: (
        currentUploaded: number,
        currentSpeed: number,
        timeLeft: number,
        finished: boolean,
        isUploading: boolean,
        error: boolean,
        errMsg: string,
    ) => void;
    onFinished?: () => void;
    onError?: () => void;
    ref?: Ref<VideoUploadItemHandle>;
}
export const VideoUploadItem: FC<VideoUploadItemProps> = (props) => {
    const {
        selected = false,
        file,
        onDelete,
        ref,
        onChange,
        onFinished,
        onError,
    } = props;
    const { taskId } = useParams();
    const {
        currentUploaded,
        currentSpeed,
        timeLeft,
        finished,
        isUploading,
        error,
        errMsg,
        handleUpload,
        handlePause,
        handleDelete,
        doDelete,
        handleReset,
    } = useUploadContext(
        file.file,
        Number(taskId),
        file.tag,
        file.immediately,
        file.roi,
        onDelete,
        onFinished,
        onError,
    );

    useEffect(() => {
        if (selected && onChange) {
            onChange(
                currentUploaded,
                currentSpeed,
                timeLeft,
                finished,
                isUploading,
                error,
                errMsg,
            );
        }
    }, [
        selected,
        currentUploaded,
        currentSpeed,
        timeLeft,
        finished,
        isUploading,
        error,
        errMsg,
        onChange,
    ]);

    useImperativeHandle(ref, () => ({
        startUpload: handleUpload,
        pauseUpload: handlePause,
        resetUpload: handleReset,
        deleteUpload: handleDelete,
        doDelete,
        isFinished: () => finished,
        isError: () => error,
        isUploading: () => isUploading,
    }));

    return (
        <div
            className={twMerge(
                "relative mr-2.5 mb-2.5 h-10 max-w-full transition-all py-2.5 pl-3 pr-1.5 text-xs cursor-pointer rounded-lg box-content",
                selected ? "bg-blue-2 text-white" : "bg-white text-text-8",
            )}
        >
            <div
                className={twMerge(
                    "overflow-hidden overflow-ellipsis text-nowrap text-sm",
                    selected && "w-[calc(100%-16px)]",
                )}
            >
                {file.file.name}
            </div>
            <div
                className={twMerge(
                    "pt-2 text-xs flex items-center gap-1",
                    finished && !selected && !error && "text-success",
                    !finished && !selected && !error && "text-gray-2",
                    selected && !error && "text-[#ffffffb2]",
                    error && "text-[#fb2c36]",
                )}
            >
                {finished && !error && <IconSuccess />}
                {!error && (
                    <div className="text-[10px]">
                        {finished
                            ? "上传完成"
                            : isUploading
                              ? "上传中..."
                              : currentUploaded === 0
                                ? "未开始"
                                : "暂停中"}
                    </div>
                )}
                {error && <div className="text-[10px]">上传失败</div>}
            </div>
            {selected && (
                <div
                    className="absolute right-1.5 top-3 h-5 text-sm text-white"
                    onClick={() => {
                        handleDelete();
                    }}
                >
                    <IconClose />
                </div>
            )}
        </div>
    );
};

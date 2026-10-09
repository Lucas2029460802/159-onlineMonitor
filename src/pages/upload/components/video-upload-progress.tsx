import { FC, useContext } from "react";

import { filePicBase64 } from "./const";

import { IconDelete, IconPause, IconReset, IconStart } from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import ProgressBar from "@/components/progress-bar";
import { size2string } from "@/util/file";
import { time2string } from "@/util/time";

interface VideoUploadProgressProps {
    file: File;
    handleUpload: () => void;
    handlePause: () => void;
    handleDelete: () => void;
    handleReset: () => void;
    currentUploaded: number;
    currentSpeed: number;
    timeLeft: number;
    finished: boolean;
    isUploading: boolean;
    error: boolean;
    errMsg: string;
}

export const VideoUploadProgress: FC<VideoUploadProgressProps> = (props) => {
    const {
        file,
        handleUpload,
        handlePause,
        handleDelete,
        handleReset,
        currentUploaded,
        currentSpeed,
        timeLeft,
        finished,
        isUploading,
        error,
        errMsg,
    } = props;

    const Confirm = useContext(ConfirmContext);

    return (
        <div className="flex items-center">
            <div
                className="w-[30px] h-[40px] mr-3"
                style={{
                    background: `url(${filePicBase64}) no-repeat`,
                    backgroundSize: "100% 100%",
                }}
            />
            <div className="flex-1">
                <div className="py-1.5 flex items-center justify-end">
                    <div className="w-full">
                        <div className="text-[13px] pb-1.5">{file.name}</div>

                        {error && (
                            <div className="flex items-center text-[#fb2c36] text-[10px]">
                                {errMsg}
                            </div>
                        )}
                        {finished && !error && (
                            <div className="flex items-center text-text-3 text-[10px]">
                                上传完毕
                            </div>
                        )}
                        {!finished && !error && (
                            <div className="flex items-center text-text-3 text-[10px]">
                                <div className="pr-[5px]">
                                    已经上传：{size2string(currentUploaded)}/
                                    {size2string(file.size)}
                                </div>
                                {currentSpeed === 0 ? (
                                    <div className="pr-[5px]">未开始</div>
                                ) : (
                                    <div className="pr-[5px]">
                                        当前速度：
                                        {size2string(currentSpeed)}/s
                                    </div>
                                )}

                                {currentSpeed !== 0 && (
                                    <div className="pr-[5px]">
                                        剩余时间：{time2string(timeLeft)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        {!finished &&
                            (!isUploading ? (
                                <button
                                    onClick={() => {
                                        handleUpload();
                                    }}
                                    className="hover:text-blue-1 text-gray-2 text-lg"
                                >
                                    <IconStart />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        handlePause();
                                    }}
                                    className="hover:text-blue-1 text-gray-2 text-lg"
                                >
                                    <IconPause />
                                </button>
                            ))}
                        {!finished && (
                            <button
                                onClick={() => {
                                    if (Confirm) {
                                        Confirm.showConfirm(
                                            "确定要重新上传吗？",
                                            "会删除已经上传的内容并重新开始上传",
                                            () => {
                                                handleReset();
                                                Confirm.hideConfirm();
                                            },
                                            () => {
                                                Confirm.hideConfirm();
                                            },
                                        );
                                    }
                                }}
                                className="hover:text-blue-1 text-gray-2 text-base"
                            >
                                <IconReset />
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="hover:text-[#fb2c36] text-gray-2 text-lg"
                        >
                            <IconDelete />
                        </button>
                    </div>
                </div>
                <ProgressBar
                    color={finished ? "#43CE5B" : undefined}
                    progress={
                        finished ? 100 : (currentUploaded / file.size) * 100
                    }
                    className="box-border"
                />
            </div>
        </div>
    );
};

import { FC, useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { UploadFile } from "..";
import { VideoBlockUploader } from "./video-block-uploader";
// import { VideoEdit } from "./video-edit";
import { VideoUploadItem, VideoUploadItemHandle } from "./video-upload-item";
import { VideoUploadProgress } from "./video-upload-progress";

import { ConfirmContext } from "@/components/confirm";
import { $UI } from "@/store/ui";

interface VideoUploadProps {
    files: UploadFile[];
}

export const VideoUpload: FC<VideoUploadProps> = ({ files }) => {
    const [fileList, setFileList] = useState<UploadFile[]>(files);
    const [selected, setSelected] = useState<number>(0);
    const Confirm = useContext(ConfirmContext);
    const [currentUploaded, setCurrentUploaded] = useState<number>(0);
    const [currentSpeed, setCurrentSpeed] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>("");
    const uploadItemRefs = useRef<(VideoUploadItemHandle | undefined)[]>(
        fileList.map(() => undefined),
    );

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (uploadItemRefs.current.length > 0) {
                event.preventDefault();
                return "您确定要离开吗？正在上传的内容可能会丢失。";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        handleFinishedOrError();
    }, [fileList]);

    const handleFinishedOrError = () => {
        for (const item of uploadItemRefs.current) {
            if (item?.isUploading() === true) continue;
            if (!item?.isFinished() && !item?.isError()) {
                item?.startUpload();
                break;
            }
        }
    };

    return (
        <div>
            {fileList.length > 0 && (
                <div className="flex flex-col gap-3 bg-gray-3 rounded-[10px] py-5 px-3 mx-8 mt-[23px]">
                    <div className="flex items-center flex-wrap">
                        {fileList.map((file, index) => (
                            <div
                                key={`video-upload-block-${file.file.name}`}
                                className={twMerge(
                                    "max-w-[218px]",
                                    fileList.length === 5 &&
                                        "w-[calc(20%-21.6px)]",
                                    fileList.length === 6 &&
                                        "w-[calc(16.6667%-18px)]",
                                    fileList.length === 7 &&
                                        "w-[calc(14.2857%-15.4286px)]",
                                    fileList.length === 8 &&
                                        "w-[calc(12.5%-13.5px)]",
                                    fileList.length === 9 &&
                                        "w-[calc(11.1111%-12px)]",
                                    fileList.length > 9 && "w-[11.1111%]",
                                )}
                                onClick={() => {
                                    setSelected(index);
                                }}
                            >
                                <VideoUploadItem
                                    file={file}
                                    selected={selected === index}
                                    ref={(el) => {
                                        if (el !== null)
                                            uploadItemRefs.current[index] = el;
                                    }}
                                    onDelete={() => {
                                        if (fileList.length === 1) {
                                            $UI.update(
                                                "trigger message",
                                                (draft) => {
                                                    draft.messageDisplay = true;
                                                    draft.messageContent =
                                                        "至少存在一个任务";
                                                    draft.messageType =
                                                        "warning";
                                                },
                                            );
                                            return;
                                        }
                                        if (Confirm) {
                                            Confirm.showConfirm(
                                                "确定要删除吗？",
                                                "会删除已经上传的内容并停止上传",
                                                () => {
                                                    uploadItemRefs.current[index]?.doDelete();
                                                    if (
                                                        selected ===
                                                        fileList.length - 1
                                                    )
                                                        setSelected(
                                                            (prev) => prev - 1,
                                                        );
                                                    setFileList((prev) =>
                                                        prev.filter(
                                                            (item) =>
                                                                item !== file,
                                                        ),
                                                    );

                                                    Confirm.hideConfirm();
                                                },
                                                () => {
                                                    Confirm.hideConfirm();
                                                },
                                            );
                                        }
                                    }}
                                    onChange={(
                                        currentUploaded,
                                        currentSpeed,
                                        timeLeft,
                                        finished,
                                        isUploading,
                                        error,
                                        errMsg,
                                    ) => {
                                        setCurrentUploaded(currentUploaded);
                                        setCurrentSpeed(currentSpeed);
                                        setTimeLeft(timeLeft);
                                        setFinished(finished);
                                        setIsUploading(isUploading);
                                        setError(error);
                                        setErrMsg(errMsg);
                                    }}
                                    onFinished={() => {
                                        handleFinishedOrError();
                                        console.log("finished");
                                    }}
                                    onError={() => {
                                        handleFinishedOrError();
                                        console.log("error");
                                    }}
                                />
                            </div>
                        ))}
                        <VideoBlockUploader
                            onUpload={(files) => {
                                const filenames = fileList.map(
                                    (item) => item.file.name,
                                );
                                setFileList((prev) => [
                                    ...prev,
                                    ...files
                                        .filter(
                                            (item) =>
                                                !filenames.includes(item.name),
                                        )
                                        .map((i) => ({
                                            file: i,
                                        })),
                                ]);
                            }}
                        />
                    </div>
                    <VideoUploadProgress
                        file={fileList[selected].file}
                        handleUpload={() => {
                            uploadItemRefs.current[selected]?.startUpload();
                        }}
                        handlePause={() => {
                            uploadItemRefs.current[selected]?.pauseUpload();
                        }}
                        handleDelete={() => {
                            uploadItemRefs.current[selected]?.deleteUpload();
                        }}
                        handleReset={() => {
                            uploadItemRefs.current[selected]?.resetUpload();
                        }}
                        currentUploaded={currentUploaded}
                        currentSpeed={currentSpeed}
                        timeLeft={timeLeft}
                        finished={finished}
                        isUploading={isUploading}
                        error={error}
                        errMsg={errMsg}
                    />
                </div>
            )}
            {/* <VideoEdit file={fileList[selected]} /> */}
        </div>
    );
};

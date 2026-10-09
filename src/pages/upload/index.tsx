import { FC, useLayoutEffect, useState } from "react";

import { VideoUpload } from "./components/video-upload";
import { VideoUploadForm } from "./components/video-upload-form";

import { ROI } from "@/api/type";
import Uploader from "@/components/drag-upload";

export type UploadFileTag = "default" | "far";
export interface UploadFile {
    file: File;
    tag?: UploadFileTag;
    immediately?: boolean;
    roi?: ROI;
}

export const Upload: FC = () => {
    const [fileList, setFileList] = useState<File[]>([]);
    const [uploadFileList, setIsUploadFileList] = useState<UploadFile[]>([]);
    const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

    useLayoutEffect(() => {
        document.title = "视频浓缩 - 上传";
    }, []);

    return (
        <div className="flex-1 overflow-scroll">
            {(fileList.length === 0 || uploadFileList.length === 0) && (
                <div className="mx-auto w-[754px] my-4 bg-white p-4">
                    <div>
                        <Uploader
                            className="h-56"
                            onUpload={(files) => {
                                const filenames = fileList.map(
                                    (item) => item.name,
                                );
                                setFileList((prev) => [
                                    ...prev,
                                    ...files.filter(
                                        (item) =>
                                            !filenames.includes(item.name),
                                    ),
                                ]);
                                setShowUploadForm(true);
                            }}
                        />
                    </div>
                    <div className="mt-3 text-xs text-text-6 flex flex-col items-center justify-center">
                        <div>过长或过大视频建议拆分进行上传</div>
                        <div>
                            网页端上传的文件大小上限为16G 视频内容时长最大10小时
                        </div>
                    </div>
                </div>
            )}
            {uploadFileList.length > 0 && (
                <div className="mx-auto w-[1100px] my-4 bg-white p-4">
                    <div className="h-16 select-none relative">
                        <div className="pl-10 pt-[26px] pb-[14px] text-base font-semibold leading-5 text-blue-1 border-b border-solid border-gray-1">
                            上传视频
                        </div>
                    </div>
                    <VideoUpload files={uploadFileList} />
                </div>
            )}
            {showUploadForm && (
                <VideoUploadForm
                    file={fileList[0]}
                    onCancel={() => {
                        setFileList([]);
                    }}
                    onClose={() => {
                        setShowUploadForm(false);
                    }}
                    onConfirm={(tag, immediately, roi) => {
                        console.log(
                            "tag",
                            tag,
                            "immediately",
                            immediately,
                            "roi",
                            roi,
                        );
                        setIsUploadFileList(
                            fileList.map((file) => ({
                                file,
                                tag: tag,
                                roi,
                                immediately,
                            })),
                        );
                    }}
                />
            )}
        </div>
    );
};

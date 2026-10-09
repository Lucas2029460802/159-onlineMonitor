import { FC, useContext, useEffect, useState } from "react";

import { UploadFileTag } from "..";
import { VideoCrop } from "./video-crop";

import { ROI } from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { CheckBox } from "@/components/checkbox";
import { ConfirmContext } from "@/components/confirm";
import { Popup } from "@/components/popup";
import { api } from "@/api";
import { extractFrame } from "@/util/video";

interface VideoUploadFormProps {
    file: File;
    onClose?: () => void;
    onCancel?: () => void;
    onConfirm?: (
        tag: UploadFileTag,
        immediately: boolean,
        roi: ROI | undefined,
    ) => void;
}

export const VideoUploadForm: FC<VideoUploadFormProps> = (props) => {
    const { file, onClose, onCancel, onConfirm } = props;
    const Confirm = useContext(ConfirmContext);

    const [, setROIFrame] = useState<string>("");
    const [firstFrame, setFirstFrame] = useState<string>("");
    const [resolutionX, setResolutionX] = useState<number>(10);
    const [resolutionY, setResolutionY] = useState<number>(10);
    const [imageWidth, setImgWidth] = useState<number>(10);
    const [imageHeight, setImgHeight] = useState<number>(10);
    const [cropX, setCropX] = useState<number>(0);
    const [cropY, setCropY] = useState<number>(0);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [taskType] = useState<UploadFileTag>("default");
    const [immediately, setImmediately] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        // 1. 先尝试浏览器本地提取（秒级完成，支持H264/MP4等浏览器可解码格式）
        extractFrame(
            file,
            (img, width, height) => {
                setFirstFrame(img);
                setResolutionX(width);
                setResolutionY(height);
                setImgWidth(width);
                setImgHeight(height);
                setCropX(0);
                setCropY(0);
                setShowPopup(true);
            },
            () => {
                // 2. 浏览器无法解码，走后端FFmpeg
                console.log("[VideoUploadForm] 浏览器无法解码，调用后端getFirstFrame");
                const chunk = file.slice(0, 5 * 1024 * 1024);
                const formData = new FormData();
                formData.append("file", chunk);
                formData.append("name", file.name);

                api.video
                    .getFirstFrame(formData)
                    .then((res: any) => {
                        console.log("[VideoUploadForm] getFirstFrame响应:", res);
                        const data = res.Data;
                        if (data?.frame) {
                            setFirstFrame("data:image/jpeg;base64," + data.frame);
                            setResolutionX(data.width);
                            setResolutionY(data.height);
                            setImgWidth(data.width);
                            setImgHeight(data.height);
                            setCropX(0);
                            setCropY(0);
                            setShowPopup(true);
                        } else {
                            console.log("[VideoUploadForm] getFirstFrame返回空frame, data:", data);
                            setError(true);
                        }
                    })
                    .catch((err) => {
                        console.log("[VideoUploadForm] getFirstFrame失败:", err);
                        setError(true);
                    });
            },
        );
    }, [file]);

    if (!showPopup && !error)
        return (
            <Popup
                show
                className="w-[800px] bg-white border-0 rounded-lg p-8 flex items-center justify-center gap-2"
            >
                文件加载中
                <IconLoading />
            </Popup>
        );

    return (
        <VideoCrop
            firstFrame={firstFrame}
            onClose={onClose}
            onCancel={() => {
                Confirm?.showConfirm(
                    "确定要关闭表单吗？",
                    "关闭表单后，上传的视频将不会被保存",
                    async () => {
                        if (onCancel) onCancel();
                        if (onClose) onClose();
                        Confirm.hideConfirm();
                    },
                    () => {
                        Confirm.hideConfirm();
                    },
                );
            }}
            onConfirm={(result, resolutionX, resolutionY, cropX, cropY) => {
                console.log(
                    "jjonconfirm",
                    "resolutionX",
                    resolutionX,
                    "resolutionY",
                    resolutionY,
                    "cropX",
                    cropX,
                    "cropY",
                    cropY,
                );
                setROIFrame(result);
                setResolutionX(resolutionX);
                setResolutionY(resolutionY);
                setCropX(cropX);
                setCropY(cropY);
                if (onConfirm)
                    onConfirm(taskType, immediately, {
                        x: cropX,
                        y: cropY,
                        w: resolutionX,
                        h: resolutionY,
                    });
                if (onClose) onClose();
            }}
            defaultValue={{
                cropX,
                cropY,
                resolutionX,
                resolutionY,
            }}
            imgWidth={imageWidth}
            imgHeight={imageHeight}
            showCrop={immediately && !error}
            onFinished={() => {
                console.log(
                    "onfinished",
                    "taskType",
                    taskType,
                    "immediately",
                    immediately,
                    "roi",
                    {
                        x: cropX,
                        y: cropY,
                        w: resolutionX,
                        h: resolutionY,
                    },
                );
                onConfirm?.(taskType, immediately, {
                    x: cropX,
                    y: cropY,
                    w: resolutionX,
                    h: resolutionY,
                });
            }}
        >
            <div className="flex items-center pt-6">
                <div className="w-25 text-text-8 font-semibold text-sm">
                    上传完成后
                </div>
                <div className="flex items-center gap-5">
                    <CheckBox
                        checked={!immediately}
                        onClick={() => setImmediately(false)}
                    >
                        手动分析
                    </CheckBox>
                    <CheckBox
                        checked={immediately}
                        onClick={() => setImmediately(true)}
                    >
                        自动分析
                    </CheckBox>
                </div>
            </div>
            {immediately ? (
                <div className="text-text-6 text-sm ml-[100px] mt-1 flex flex-col gap-1">
                    <div>适用范围：同一机位，不同时间段的监控视频</div>
                    <div>
                        操作说明：需在下方设置关注区域，上传完毕后将【自动】触发分析
                    </div>
                    <div>注意事项：所有上传的视频均使用【同一个】关注区域</div>
                    <div>查看结果：页面右上角【视频管理】页面</div>
                </div>
            ) : (
                <div className="text-text-6 text-sm ml-[100px] mt-1 flex flex-col gap-1">
                    <div>适用范围：【不同机位】的监控视频</div>
                    <div>
                        操作说明：上传完毕后需至【视频管理】点击分析，并设置关注区域。
                    </div>
                </div>
            )}
            {error && immediately && (
                <div className="text-[#FB2C35] text-sm ml-[100px]">
                    该格式文件不支持自动分析同时划选注意力区域，如需划选注意力区域请手动分析
                </div>
            )}
        </VideoCrop>
    );
};

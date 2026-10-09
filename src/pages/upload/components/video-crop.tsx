import { FC, ReactNode, useState } from "react";

import { IconClose } from "@/assets/svg";
import Cropper from "@/components/cropper";
import { Popup } from "@/components/popup";

export interface VideoCropValue {
    resolutionX: number;
    resolutionY: number;
    cropX: number;
    cropY: number;
}

interface VideoCropProps {
    firstFrame: string;
    onClose?: () => void;
    onCancel?: () => void;
    onConfirm?: (
        result: string,
        resolutionX: number,
        resolutionY: number,
        cropX: number,
        cropY: number,
    ) => void;
    defaultValue?: VideoCropValue;
    imgWidth: number;
    imgHeight: number;
    children?: ReactNode;
    showCrop?: boolean;
    onFinished?: () => void;
}

const PreviewImgWidth = 155;
const CropComponentHeight = 298;

export const VideoCrop: FC<VideoCropProps> = (props) => {
    const {
        firstFrame,
        onClose,
        onCancel,
        onConfirm,
        defaultValue,
        imgWidth,
        imgHeight,
        children,
        showCrop = true,
        onFinished,
    } = props;

    const [resolutionX, setResolutionX] = useState<number>(
        defaultValue?.resolutionX ?? 10,
    );
    const [resolutionY, setResolutionY] = useState<number>(
        defaultValue?.resolutionY ?? 10,
    );
    const [cropX, setCropX] = useState<number>(defaultValue?.cropX ?? 0);
    const [cropY, setCropY] = useState<number>(defaultValue?.cropY ?? 0);
    const scale = CropComponentHeight / imgHeight;

    const handleCrop = () => {
        if (firstFrame === undefined || firstFrame === "") {
            onFinished?.();
            if (onClose) onClose();
            return;
        }
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const img = new Image();
        img.src = firstFrame;
        img.onload = () => {
            canvas.width = resolutionX;
            canvas.height = resolutionY;
            context?.drawImage(
                img,
                cropX,
                cropY,
                resolutionX,
                resolutionY,
                0,
                0,
                resolutionX,
                resolutionY,
            );
            const croppedImage = canvas.toDataURL();
            if (onConfirm) {
                console.log("这里执行了");
                onConfirm(croppedImage, resolutionX, resolutionY, cropX, cropY);
            }
            if (onClose) onClose();
        };
    };

    return (
        <Popup show className="w-[800px] bg-white border-0 rounded-lg">
            <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between">
                <div className="text-blue-2 ">截取注意力区域</div>
                <IconClose
                    className="text-lg text-gray-2 cursor-pointer"
                    onClick={() => {
                        if (onCancel) onCancel();
                        else if (onClose) onClose();
                    }}
                />
            </div>
            <div className="px-8">
                <div className="w-[736px]">
                    {children !== undefined && children}
                    {showCrop && (
                        <div className="flex items-center justify-between">
                            <div className="text-text-8 text-sm font-medium mb-[17px] mt-7">
                                拖拽选框裁剪
                            </div>
                            <div
                                className="text-text-8 text-sm font-medium mb-[17px] mt-7"
                                style={{ width: PreviewImgWidth }}
                            >
                                截图预览
                            </div>
                        </div>
                    )}

                    {showCrop && (
                        <div className="h-[298px] max-h-[298px] flex items-start justify-between">
                            <Cropper
                                imageSrc={firstFrame}
                                onCrop={(
                                    lx: number,
                                    ly: number,
                                    rx: number,
                                    ry: number,
                                ) => {
                                    setResolutionX(rx - lx);
                                    setResolutionY(ry - ly);
                                    setCropX(lx);
                                    setCropY(ly);
                                }}
                                height={CropComponentHeight}
                                defaultValue={
                                    defaultValue !== undefined
                                        ? {
                                              x1: defaultValue.cropX * scale,
                                              y1: defaultValue.cropY * scale,
                                              x2:
                                                  (defaultValue.cropX +
                                                      defaultValue.resolutionX) *
                                                  scale,
                                              y2:
                                                  (defaultValue.cropY +
                                                      defaultValue.resolutionY) *
                                                  scale,
                                          }
                                        : undefined
                                }
                            />
                            <div
                                className="overflow-hidden"
                                style={{
                                    width: PreviewImgWidth,
                                    height:
                                        (resolutionY / resolutionX) *
                                        PreviewImgWidth,
                                }}
                            >
                                <img
                                    src={firstFrame}
                                    className="min-w-0 min-h-0 max-w-none max-h-none block"
                                    style={{
                                        width:
                                            (imgWidth / resolutionX) *
                                            PreviewImgWidth,
                                        height:
                                            (imgHeight / resolutionX) *
                                            PreviewImgWidth,
                                        transform: `translateX(${-(cropX / resolutionX) * PreviewImgWidth}px) translateY(${-(cropY / resolutionX) * PreviewImgWidth}px)`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {showCrop && (
                        <div className="mt-[15px] flex items-center justify-between">
                            <div className="text-[#bbbbbb] text-xs">
                                *tips：请尽量将关键信息放置在红框区域内
                            </div>
                            <div className="text-[#6a6a6a] text-xs">
                                已截取分辨率：{resolutionX} * {resolutionY}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-8 my-12">
                        <button
                            className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-gray-1 bg-white text-text-5 rounded-sm flex items-center justify-center cursor-pointer hover:bg-border-2"
                            onClick={() => {
                                if (onCancel) onCancel();
                                else if (onClose) onClose();
                            }}
                        >
                            取消
                        </button>
                        <button
                            className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-blue-1 bg-blue-1 text-white rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#00b5e5] hover:border-[#00b5e5]"
                            onClick={handleCrop}
                        >
                            完成
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

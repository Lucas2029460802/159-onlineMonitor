import { FC, useEffect, useState } from "react";

import { VideoCrop } from "./video-crop";

import { extractFrame } from "@/util/video";

interface VideoEditProps {
    file: File;
}

export const VideoEdit: FC<VideoEditProps> = (props) => {
    const { file } = props;
    const [roiFrame, setROIFrame] = useState<string>("");
    const [firstFrame, setFirstFrame] = useState<string>("");
    const [showCrop, setShowCrop] = useState<boolean>(false);
    const [resolutionX, setResolutionX] = useState<number>(10);
    const [resolutionY, setResolutionY] = useState<number>(10);
    const [imageWidth, setImgWidth] = useState<number>(10);
    const [imageHeight, setImgHeight] = useState<number>(10);
    const [cropX, setCropX] = useState<number>(0);
    const [cropY, setCropY] = useState<number>(0);

    useEffect(() => {
        extractFrame(file, (img, width, height) => {
            setROIFrame(img);
            setFirstFrame(img);
            setResolutionX(width);
            setResolutionY(height);
            setImgWidth(width);
            setImgHeight(height);
            setCropX(0);
            setCropY(0);
        });
    }, [file]);

    return (
        <div className="mt-[30px] mr-[30px] text-text-4">
            <div className="ml-8 font-semibold">基本设置</div>
            <div className="ml-5 mt-6 flex items-center">
                <div className="text-sm w-[134px]">注意力区域</div>
                <div className="flex">
                    <div
                        className="w-[169px] h-[127px] rounded-sm cursor-pointer"
                        style={{
                            background: `url(${roiFrame}) center center / cover no-repeat rgb(244, 245, 247)`,
                        }}
                        onClick={() => setShowCrop(true)}
                    ></div>
                </div>
            </div>
            {showCrop && (
                <VideoCrop
                    firstFrame={firstFrame}
                    onClose={() => {
                        setShowCrop(false);
                    }}
                    onConfirm={(
                        result,
                        resolutionX,
                        resolutionY,
                        cropX,
                        cropY,
                    ) => {
                        setROIFrame(result);
                        setResolutionX(resolutionX);
                        setResolutionY(resolutionY);
                        setCropX(cropX);
                        setCropY(cropY);
                    }}
                    defaultValue={{
                        cropX,
                        cropY,
                        resolutionX,
                        resolutionY,
                    }}
                    imgWidth={imageWidth}
                    imgHeight={imageHeight}
                />
            )}
        </div>
    );
};

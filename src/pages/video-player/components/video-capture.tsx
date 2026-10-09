import { useRef, useState } from "react";
import React from "react";

import { createVideoFrameURL } from "./capture/canvas-drawing";
import Capture, { AfterCropCallback, CaptureHandle } from "./capture/capture";
import CaputreIcon from "../assets/capture/caputre.svg?react";
interface VideoCaptureProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VideoCapture({
    videoRef,
    containerRef,
    setIsPaused,
}: VideoCaptureProps) {
    const [imgSrc, setImgSrc] = useState("");
    const captureRef = useRef<CaptureHandle | null>(null);
    // 点击触发展示，并且设置新图片
    const handleIconClick = () => {
        if (captureRef.current === null || videoRef.current === null) {
            console.log("怎么会不存在的");
            return;
        }
        // 暂停
        videoRef.current.pause();
        setIsPaused(true);
        const imgSrc = createVideoFrameURL(videoRef);
        setImgSrc(imgSrc);
        captureRef.current.show();
    };

    // 处理capture组件
    const afterCrop: AfterCropCallback = (
        cropCord,
        cropImageSrc,
        startDomPos,
        endDomPos,
        e,
    ) => {
        console.log(cropCord, e.clientX);
        console.log(cropImageSrc);
    };

    return (
        <div>
            <div
                className="w-[50px] h-[22px] cursor-pointer text-center text-highlight relative group"
                onClick={handleIconClick}
            >
                <div
                    className="absolute -top-12  text-sm whitespace-nowrap bg-black text-white p-2 left-1/2 -translate-x-1/2 
                opacity-0 group-hover:opacity-100 pointer-events-none"
                >
                    截图增强
                </div>
                <CaputreIcon />
            </div>
            <Capture
                containerRef={containerRef}
                imageSrc={imgSrc}
                afterCrop={afterCrop}
                ref={captureRef}
            />
        </div>
    );
}

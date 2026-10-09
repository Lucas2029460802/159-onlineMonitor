import { useEffect, useRef, useState } from "react";
import { RefObject } from "react";
import { createPortal } from "react-dom";

import { SurveillanceCameraInfo } from "../../types";
import { convertNumberArrToFlowline, drawHexagon, drawLine } from "../../util";

import { IconPcDirection } from "@/assets/svg";

interface PcDirectionProps {
    svInfo: SurveillanceCameraInfo;
    videoRef: RefObject<HTMLVideoElement | null>;
    isFullScreen: boolean;
}

export default function PcDirection({
    svInfo,
    videoRef,
    isFullScreen,
}: PcDirectionProps) {
    const [showCanvas, setShowCanvas] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [videoParent, setVideoParent] = useState<HTMLElement | null>(null);
    const line1 = svInfo.line_points_entrance!;

    const line2 = svInfo.line_points_out_in2out!;
    const shrink = !isFullScreen;
    console.log(`shirkn is ${shrink}, isFullScreen is ${isFullScreen}`);
    // 获取 video 父容器
    useEffect(() => {
        if (videoRef.current) {
            setVideoParent(videoRef.current.parentElement);
        }
    }, [videoRef]);

    const drawCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const flowLine1 = line1.map(convertNumberArrToFlowline);
        flowLine1.forEach((line) => {
            drawLine(ctx, line, 1, false, shrink);
        });
        drawHexagon(
            ctx,
            flowLine1,
            "rgba(0,0,255,0.3)",
            "rgba(0,0,255,0.8)",
            shrink,
        );
        const flowLine2 = convertNumberArrToFlowline(line2);
        drawLine(ctx, flowLine2, 2, false, shrink);
    };

    // 同步 canvas 尺寸和位置，同时绘制
    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const resizeCanvas = () => {
            const rect = video.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.pointerEvents = "none";

            // 清空 + 重绘
            drawCanvas();
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        document.addEventListener("fullscreenchange", resizeCanvas);
        document.addEventListener("webkitfullscreenchange", resizeCanvas);
        document.addEventListener("mozfullscreenchange", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            document.removeEventListener("fullscreenchange", resizeCanvas);
            document.removeEventListener(
                "webkitfullscreenchange",
                resizeCanvas,
            );
            document.removeEventListener("mozfullscreenchange", resizeCanvas);
        };
    }, [videoRef, showCanvas, svInfo, isFullScreen]);

    // 当 showCanvas 或 svInfo 改变时也绘制一次
    useEffect(() => {
        if (showCanvas) drawCanvas();
    }, [showCanvas, svInfo, isFullScreen]);

    if (!videoParent) return null;

    return (
        <>
            {/* 按钮 */}
            <div className="w-[50px] h-[22px] cursor-pointer text-center text-highlight relative group">
                <div
                    className="absolute -top-12 text-sm whitespace-nowrap bg-black text-white p-2 left-1/2 -translate-x-1/2 
          opacity-0 group-hover:opacity-100 pointer-events-none"
                >
                    人流方向
                </div>
                <IconPcDirection
                    className="w-full h-full"
                    onClick={() => setShowCanvas((prev) => !prev)}
                />
            </div>

            {createPortal(
                showCanvas && <canvas ref={canvasRef} />,
                videoParent,
            )}
        </>
    );
}

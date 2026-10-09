import React from "react";

import { Point } from "./capture";

// 绘制黑色背景底
export function drawDarkBackground(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
    if (canvasRef.current === null) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context === null) return;
    context.fillStyle = "rgba(0, 0, 0, 1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// 绘制原始图片
export function drawOriginalImage(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imageRef: React.RefObject<HTMLImageElement>,
    imageCvsTopLeft: React.RefObject<{ top: number; left: number }>,
) {
    if (canvasRef.current !== null) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (context === null || imageRef.current.src === "") return;
        context.drawImage(
            imageRef.current,
            imageCvsTopLeft.current.left, // 画面的位置不一定铺满canvas，所以需要从画面左上角开始
            imageCvsTopLeft.current.top,
            imageRef.current.width,
            imageRef.current.height,
        );
    }
}
// 图片之上的mask
export function drawImageDarkMask(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imageRef: React.RefObject<HTMLImageElement>,
    imageCvsTopLeft: React.RefObject<{ top: number; left: number }>,
) {
    if (canvasRef.current === null) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context === null) return;
    context.fillStyle = "rgba(0, 0, 0, 0.4)";
    context.fillRect(
        imageCvsTopLeft.current.left,
        imageCvsTopLeft.current.top,
        imageRef.current.width,
        imageRef.current.height,
    );
}
// 绘制选中区域
export function drawSelectArea(
    rectStart: Point,
    rectEnd: Point,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    image: HTMLImageElement,
    imageCvsTopLeft: React.RefObject<{ top: number; left: number }>,
) {
    if (canvasRef.current === null) return;

    const context = canvasRef.current.getContext("2d");
    if (context !== null) {
        // 需要获取截取位置相对于在Iamge坐标系下的位置

        context.drawImage(
            image,
            rectStart.x - imageCvsTopLeft.current.left,
            rectStart.y - imageCvsTopLeft.current.top,
            rectEnd.x - rectStart.x,
            rectEnd.y - rectStart.y,
            rectStart.x,
            rectStart.y,
            rectEnd.x - rectStart.x,
            rectEnd.y - rectStart.y,
        );
        context.strokeStyle = "white"; // 边框颜色
        context.lineWidth = 3; // 边框宽度
        context.strokeRect(
            rectStart.x,
            rectStart.y,
            rectEnd.x - rectStart.x,
            rectEnd.y - rectStart.y,
        );
    }
}

export function clearCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");
    if (context === null) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
}
// 从指定canvas中提取出图片
export function extractSelectedImage(
    cropX: number,
    cropY: number,
    cropWidth: number,
    cropHeight: number,
    imageRef: React.RefObject<HTMLImageElement>,
) {
    const img = imageRef.current;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = cropWidth;
    offscreenCanvas.height = cropHeight;

    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
    );

    // 获取裁剪区域的Base64

    return offscreenCanvas.toDataURL("image/jpeg", 0.9);
}
// 计算dom坐标在canvas中的坐标
export function calcInCanvasCord(
    x: number,
    y: number,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
): Point | null {
    if (canvasRef.current === null) return null;
    const { left, top, width, height } =
        canvasRef.current.getBoundingClientRect();
    const resX = ((x - left) / width) * canvasRef.current.width;
    const resY = ((y - top) / height) * canvasRef.current.height;
    return {
        x: resX,
        y: resY,
    };
}

export function drawCaptureInDark(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imageRef: React.RefObject<HTMLImageElement>,
    imageCvsTopLeft: React.RefObject<{ top: number; left: number }>,
) {
    clearCanvas(canvasRef);
    drawDarkBackground(canvasRef);
    drawOriginalImage(canvasRef, imageRef, imageCvsTopLeft);
    drawImageDarkMask(canvasRef, imageRef, imageCvsTopLeft);
}

export function createVideoFrameURL(
    videoRef: React.RefObject<HTMLVideoElement | null>,
): string {
    if (videoRef.current === null) return "";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx === null) return "";
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpg", 0.9);
}

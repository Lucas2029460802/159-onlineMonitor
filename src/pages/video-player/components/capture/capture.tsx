import {
    MouseEvent as MouseEventReact,
    Ref,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import ReactDOM from "react-dom";

import {
    drawSelectArea,
    extractSelectedImage,
    calcInCanvasCord,
    drawCaptureInDark,
} from "./canvas-drawing";
import CaptureAction from "./capture-action";
import { OutMask, OutMaskHandle } from "./out-mask";
import { clamp } from "../../util";
export interface Point {
    x: number;
    y: number;
}

interface CropCordinates {
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
}

export type AfterCropCallback = (
    cropCord: CropCordinates,
    cropImageSrc: string,
    leftBottomDomPos: Point,
    rightBottomDomPos: Point,
    e: MouseEvent,
) => void;

export interface CaptureHandle {
    show: () => void;
    off: () => void;
}
interface CaptureProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    imageSrc: string;
    afterCrop: AfterCropCallback;
    ref: Ref<CaptureHandle>;
}
export default function Capture({
    containerRef,
    imageSrc,
    afterCrop,
    ref,
}: CaptureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState(new Image());
    const imageRef = useRef(image);
    const imageCvsTopLeft = useRef({ top: 0, left: 0 }); // scene在canvas中的起始坐标
    const imageDomTopLeft = useRef({ top: 0, left: 0, width: 0, height: 0 }); // scene在dom中的坐标
    const [shouldShow, setShouldShow] = useState(false); // 控制自身显隐
    const outMaskRef = useRef<OutMaskHandle | null>(null);
    const cropImageSrc = useRef<string>(null);
    // 当需要展示时，更新image元素和canvas画布尺寸，做好坐标映射关系
    useEffect(() => {
        if (!shouldShow) return;
        const img = new Image();
        console.log("这个会被触发吗");
        img.src = imageSrc;
        img.onload = () => {
            setImage(img);
            imageRef.current = img;
            setCanvasPixelProjection(img);
        };
    }, [imageSrc, shouldShow]);

    // 展示时绘制图片
    useEffect(() => {
        if (canvasRef.current && containerRef.current && shouldShow) {
            console.log("大draw 特draw");
            drawCaptureInDark(canvasRef, imageRef, imageCvsTopLeft);
        }
    }, [containerRef, image, shouldShow]);

    // 挂载事件
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setShouldShow(false);
        }
    };
    useEffect(() => {
        window.addEventListener("mousemove", captureMove, { capture: true });
        window.addEventListener("mouseup", captureUp, { capture: true });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("mousemove", captureMove, {
                capture: true,
            });
            window.removeEventListener("mouseup", captureUp, { capture: true });
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    const isInScene = (clientX: number, clientY: number) => {
        const { left, top, width, height } = imageDomTopLeft.current;
        if (clientX < left || clientX > left + width) return false;
        if (clientY < top || clientY > top + height) return false;
        return true;
    };
    const clampInScene = (clientX: number, clientY: number) => {
        const { left, top, width, height } = imageDomTopLeft.current;
        return {
            x: clamp(clientX, left, left + width),
            y: clamp(clientY, top, top + height),
        };
    };
    const startPoint = useRef({ x: 0, y: 0 });
    const endPoint = useRef({ x: 500, y: 500 });
    const isDrawing = useRef<boolean>(false);
    const moved = useRef<boolean>(false);
    const captureDown = (e: MouseEventReact) => {
        drawCaptureInDark(canvasRef, imageRef, imageCvsTopLeft); // 清空画布
        if (e.button !== 0) return; // 必须是左键
        if (!isInScene(e.clientX, e.clientY)) return;
        startPoint.current = { x: e.clientX, y: e.clientY };
        isDrawing.current = true;
        setShowCapAction(false); // 工具栏消失
        moved.current = false;
    };
    const captureMove = (e: MouseEvent) => {
        if (isDrawing.current === false) return;
        moved.current = true;

        const rectStart = calcInCanvasCord(
            startPoint.current.x,
            startPoint.current.y,
            canvasRef,
        );
        const nowPoint = clampInScene(e.clientX, e.clientY);
        const rectEnd = calcInCanvasCord(nowPoint.x, nowPoint.y, canvasRef);
        if (!rectStart || !rectEnd) return;
        // 绘制
        drawCaptureInDark(canvasRef, imageRef, imageCvsTopLeft);
        drawSelectArea(
            rectStart,
            rectEnd,
            canvasRef,
            imageRef.current,
            imageCvsTopLeft,
        );
    };
    const captureUp = (e: MouseEvent) => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        if (!canvasRef.current || !moved.current) return;

        // 计算最终选中的区域
        const rectStart = calcInCanvasCord(
            startPoint.current.x,
            startPoint.current.y,
            canvasRef,
        );
        const nowPoint = clampInScene(e.clientX, e.clientY);
        endPoint.current = nowPoint; // 设置了终止节点
        const rectEnd = calcInCanvasCord(nowPoint.x, nowPoint.y, canvasRef);

        if (!rectStart || !rectEnd) return;

        // 计算选区在原始图片中的坐标
        const cropX =
            Math.min(rectStart.x, rectEnd.x) - imageCvsTopLeft.current.left;
        const cropY =
            Math.min(rectStart.y, rectEnd.y) - imageCvsTopLeft.current.top;
        const cropWidth = Math.abs(rectEnd.x - rectStart.x);
        const cropHeight = Math.abs(rectEnd.y - rectStart.y);

        if (cropX < 0 || cropY < 0 || cropWidth === 0 || cropHeight === 0)
            return;
        cropImageSrc.current = extractSelectedImage(
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            imageRef,
        );

        if (cropImageSrc.current === null)
            throw Error(
                JSON.stringify({ code: "100", msg: "生成cropImage失败" }),
            );
        setShowCapAction(true); // 工具栏出现

        afterCrop(
            { cropX, cropY, cropWidth, cropHeight },
            cropImageSrc.current,
            startPoint.current,
            nowPoint,
            e,
        );
    };
    const handleFullScreenChange = () => {
        setCanvasPixelProjection(imageRef.current);
        setShowCapAction(false); // 工具栏也滚
        console.log("full screen change");
        drawCaptureInDark(canvasRef, imageRef, imageCvsTopLeft);
    };

    // 全屏退出时重新设置画布
    useEffect(() => {
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullScreenChange,
            );
        };
    }, []);

    // 根据图片元素和container元素，设置canvas像素映射和画面黑片的left top 偏差
    function setCanvasPixelProjection(img: HTMLImageElement) {
        console.log("设置Projection");
        if (canvasRef.current === null || containerRef.current === null) return;
        // 设置上下黑边高度
        const { width, height, top, left } =
            containerRef.current.getBoundingClientRect();
        const containerAspect = width / height;
        const canvasAspect = img.width / img.height;
        if (canvasAspect >= containerAspect) {
            // 画面更宽，宽将占满，只需计算黑色高度差
            const canvasDomHeight = width / canvasAspect;
            // 设置像素映射比例
            canvasRef.current.width = img.width; //  width对应画布像素img.width
            canvasRef.current.height = img.width / containerAspect; // height映射 h * im_w / w
            console.log("有高度黑边", (height - canvasDomHeight) / 2);
            // 画像在canvas内坐标
            // 画像在dom中坐标
            imageDomTopLeft.current = {
                left,
                top: (height - canvasDomHeight) / 2 + top,
                width,
                height: canvasDomHeight,
            };
        } else {
            // 画面更高，高将占满，只需计算黑色宽度差
            const canvasSceneWidth = height * canvasAspect;
            // 设置像素映射比例
            canvasRef.current.width = img.height * containerAspect; // width 映射 w / h * im_h
            canvasRef.current.height = img.height; // height 映射 im_h
            imageDomTopLeft.current = {
                left: (width - canvasSceneWidth) / 2 + left,
                top,
                width: canvasSceneWidth,
                height,
            };
            // 画像在dom中坐标
        }
        const cvsTopLeft = calcInCanvasCord(
            imageDomTopLeft.current.left,
            imageDomTopLeft.current.top,
            canvasRef,
        )!;
        imageCvsTopLeft.current = { left: cvsTopLeft.x, top: cvsTopLeft.y };
    }

    // 暴露给父亲
    useImperativeHandle(ref, () => {
        return {
            show() {
                setShouldShow(true);
                if (outMaskRef.current !== null) outMaskRef.current.show();
            },
            off() {
                setShouldShow(false);
                if (outMaskRef.current !== null) outMaskRef.current.off();
            },
        };
    }, []);

    // --- 控制截图工具栏
    const [showCapAction, setShowCapAction] = useState(false);
    useEffect(() => {
        if (shouldShow === false) setShowCapAction(false);
        return () => {};
    }, [shouldShow]);

    if (!containerRef.current) {
        return null;
    }
    return ReactDOM.createPortal(
        <>
            {shouldShow && (
                <div>
                    <canvas
                        className="w-full h-full z-[101] absolute top-0 left-0"
                        ref={canvasRef}
                        onMouseDown={captureDown}
                    ></canvas>
                    {showCapAction && (
                        <CaptureAction
                            containerRef={containerRef}
                            startDomPos={startPoint.current}
                            endDomPos={endPoint.current}
                            cropImageSrc={cropImageSrc.current}
                            onExit={() => {
                                setShouldShow(false);
                                if (outMaskRef.current !== null)
                                    outMaskRef.current.off();
                            }}
                        ></CaptureAction>
                    )}
                </div>
            )}
            <OutMask ref={outMaskRef}></OutMask>
        </>,
        containerRef.current, // 传送到containerRef组件中
    );
}

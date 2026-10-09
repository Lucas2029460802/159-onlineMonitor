import { Button, ConfigProvider, Timeline } from "antd";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { drawLine } from "../../util";

import { IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
import { Message } from "@/util/ui";

export interface FlowLine {
    start: { x: number; y: number };
    end: { x: number; y: number };
}

interface DrawPopupProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onClose: (success: boolean, ...lines: (FlowLine | null)[]) => void;
    showPopup: boolean;
}

function getTimelineItems(curStep: number) {
    const steps = ["步骤一", "步骤二", "完成"];
    const gap = <div style={{ height: "40px" }} />; // 控制每个时间点的线段长度

    return steps.map((label, index) => ({
        color: index < curStep ? "green" : "gray",
        children: (
            <div>
                {label}
                {gap}
            </div>
        ),
    }));
}

export default function DrawPopup({
    videoRef,
    onClose,
    showPopup,
}: DrawPopupProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const curVideoImage = useRef<ImageBitmap | null>(null);
    const [step, setStep] = useState(1); // 1: 画进出口线(3条), 2: 画方向线(1条)
    const [lines, setLines] = useState<FlowLine[]>([]);
    const [currentLine, setCurrentLine] = useState<FlowLine | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // ✅ 初始化：只绘制一次视频帧
    useEffect(() => {
        const createBitMap = async () => {
            if (!videoRef.current || !showPopup) return;
            curVideoImage.current = await createImageBitmap(videoRef.current);
        };
        createBitMap();
    }, [showPopup, videoRef]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 设置画布尺寸与视频一致
        canvas.width = video.videoWidth !== 0 ? video.videoWidth : 1920;
        canvas.height = video.videoHeight !== 0 ? video.videoHeight : 1080;

        ctx.drawImage(
            curVideoImage.current ?? video,
            0,
            0,
            canvas.width,
            canvas.height,
        );
        lines.forEach((line, i) => {
            drawLine(ctx, line, i <= 2 ? 1 : 2);
        });
    }, [videoRef, showPopup, lines]);

    // ✅ 每次线条更新都重新绘制
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const video = videoRef.current;
        if (!canvas || !ctx || !video) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            curVideoImage.current ?? video,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        lines.forEach((line, i) => {
            drawLine(ctx, line, i <= 2 ? 1 : 2);
        });
        if (currentLine) drawLine(ctx, currentLine, step, true);
    }, [lines, currentLine, step, videoRef]);

    // ✅ 鼠标事件
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (step === 1 && lines.length >= 3) {
            Message.warning("", "已绘制三条进出口线，请点击完成步骤一或撤销");
            return;
        }
        if (step === 2 && lines.length >= 4) {
            Message.warning("", "方向线已画好，请点击完成步骤二或撤销");
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvas.clientWidth;
        const y = (e.clientY - rect.top) / canvas.clientHeight;
        setIsDrawing(true);
        setCurrentLine({ start: { x, y }, end: { x, y } });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentLine) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvas.clientWidth;
        const y = (e.clientY - rect.top) / canvas.clientHeight;
        setCurrentLine({ ...currentLine, end: { x, y } });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentLine) return;
        setIsDrawing(false);
        setLines([...lines, currentLine]);
        setCurrentLine(null);
    };

    // ✅ 控制逻辑
    const handleConfirmStep = () => {
        if (step === 1) {
            if (lines.length < 3)
                return Message.warning(
                    "请先绘制三条进出口线！",
                    "请先绘制三条进出口线！",
                );
            setStep(2);
        } else if (step === 2) {
            if (lines.length < 4)
                return Message.warning("请先绘制方向线", "请先绘制方向线");
            setStep(3);
        } else {
            onClose(true, ...lines);
        }
    };

    const handleUndo = () => {
        if (lines.length === 0) return;
        const newLines = [...lines];
        newLines.pop();
        setLines(newLines);

        // 自动回退 step 状态
        if (step === 2 && newLines.length < 3) setStep(1);
        if (step === 3 && newLines.length < 4) setStep(2);
    };

    const handleCancelStep = () => {
        setStep(1);
        setLines([]);
    };

    return (
        <Popup
            show={showPopup}
            className="w-[900px] bg-white border-0 rounded-lg"
            ref={rootRef}
        >
            {/* 标题 */}
            <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between text-lg">
                <div className="text-blue-2">
                    {step === 1
                        ? "步骤一：绘制三条进出口直线(完成后需点击下方按钮)"
                        : step === 2
                          ? "步骤二：绘制人流进入方向(完成后需点击下方按钮)"
                          : "步骤三：最终提交"}
                </div>
                <IconClose
                    className="text-lg text-gray-2 cursor-pointer"
                    onClick={() => {
                        onClose(false, null, null, null, null);
                    }}
                />
            </div>

            {/* 内容区 */}
            <div className="flex p-4 gap-4 h-100">
                <div className="flex-1 relative w-4/5 aspect-video">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full border border-[#e5e7eb] cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                    />
                </div>

                <div className="w-32">
                    <ConfigProvider
                        theme={{
                            components: {
                                Timeline: {
                                    tailWidth: 2,
                                },
                            },
                        }}
                    >
                        <Timeline
                            className="h-full"
                            items={getTimelineItems(step)}
                        ></Timeline>
                    </ConfigProvider>
                </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-4 p-4 border-t border-[#d1d5dc]">
                <Button
                    color={"primary"}
                    variant="solid"
                    onClick={handleConfirmStep}
                >
                    {step === 1
                        ? "完成步骤一"
                        : step === 2
                          ? "完成步骤二"
                          : "最终提交"}
                </Button>

                <Button
                    className={twMerge(
                        "text-white border-none",
                        lines.length === 0
                            ? "bg-[#99a1af] hover:bg-[#7e8693] cursor-not-allowed"
                            : "bg-[#99a1af] hover:bg-[#7e8693]",
                    )}
                    onClick={handleUndo}
                    disabled={lines.length === 0}
                >
                    撤销
                </Button>

                <Button
                    className="ml-auto text-black border-none bg-[#d1d5dc] hover:bg-[#bfc5ce]"
                    onClick={handleCancelStep}
                >
                    清空
                </Button>
            </div>
        </Popup>
    );
}

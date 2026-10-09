import { twMerge } from "tailwind-merge";

import { AdditionImgInfo } from "@/api/type";

export interface ThreePicProps {
    loading: boolean;
    data: AdditionImgInfo;
}
export default function ThreePic({ loading, data }: ThreePicProps) {
    const makeUrl = (s: string) =>
        `${window.origin}/api/video/screenshot?image_path=${s}`;
    const emptyUrl = (s: string) => s === "default_event.png";
    return (
        <div className="p-6 grid grid-cols-[1.6fr_1fr] gap-6 overflow-hidden flex-1">
            {/* 左侧：原始全景图 */}
            <div className="flex flex-col gap-2 overflow-hidden">
                <div className="text-sm font-semibold text-[#62748e] flex justify-between items-center px-1">
                    <span>原始全景画面 (16:9)</span>
                    <span className="font-normal text-xs italic text-[#90a1b9]">
                        红框相对图片真实边缘定位
                    </span>
                </div>

                <div className="relative flex-1 bg-[#e2e8f0] rounded-xl overflow-hidden flex items-center justify-center border border-[#e2e8f0] shadow-inner">
                    {loading ? (
                        <div className="text-white animate-pulse">
                            加载监控画面中...
                        </div>
                    ) : (
                        <div className="relative inline-block max-w-full max-h-full">
                            <img
                                src={makeUrl(data.originalSrc)}
                                className={twMerge(
                                    "block max-w-full max-h-[calc(85vh-100px)] object-contain",
                                    emptyUrl(data.originalSrc)
                                        ? "opacity-20"
                                        : "",
                                )}
                                alt="Original"
                            />

                            {/* BBox 使用 w, h 渲染 */}
                            {data.bbox !== null && (
                                <div
                                    className="absolute border-2 border-[#fb2c36] shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none transition-all duration-500"
                                    style={{
                                        left: `${data.bbox.x * 100}%`,
                                        top: `${data.bbox.y * 100}%`,
                                        width: `${data.bbox.w * 100}%`,
                                        height: `${data.bbox.h * 100}%`,
                                    }}
                                >
                                    <div className="absolute -top-[22px] left-0 bg-[#fb2c36] text-white text-[10px] px-1 rounded-sm whitespace-nowrap shadow-sm">
                                        捕捉目标
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 右侧：人脸与捕捉目标 */}
            <div className="flex flex-col gap-6 overflow-hidden">
                {/* 2. 右上：人脸 - 缩小占比，占据约 1/3 ~ 1/4 (h-[30%]) */}
                <div className="flex flex-col gap-2 h-[30%] overflow-hidden">
                    <div className="text-sm font-semibold text-[#62748e] px-1">
                        目标特写 (人脸)
                    </div>
                    <div className="flex-1 bg-[#e2e8f0] rounded-xl overflow-hidden border border-[#e2e8f0] shadow-sm flex items-center justify-center transition-transform ">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-[#90a1b9] animate-pulse">
                                ...
                            </div>
                        ) : (
                            <img
                                src={makeUrl(data.faceSrc)}
                                className={twMerge(
                                    "w-full h-full object-contain",
                                    emptyUrl(data.faceSrc) ? "opacity-20" : "",
                                )}
                                alt="Face"
                            />
                        )}
                    </div>
                </div>

                {/* 2. 右下：捕捉图 - 占据剩余空间 (flex-1) */}
                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                    <div className="text-sm font-semibold text-[#62748e] px-1">
                        捕获人/车图
                    </div>
                    <div className="flex-1 bg-[#e2e8f0] rounded-xl overflow-hidden border border-[#e2e8f0] shadow-sm flex items-center justify-center">
                        {loading ? (
                            <div className="animate-pulse">...</div>
                        ) : (
                            <img
                                src={makeUrl(data.bodySrc)}
                                className={twMerge(
                                    "w-full h-full object-contain",
                                    emptyUrl(data.bodySrc) ? "opacity-20" : "",
                                )}
                                alt="Captured"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

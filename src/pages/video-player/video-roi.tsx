import { memo, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import TargetIcon from "./assets/target.svg?react";
interface VideoROIProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    resolution: string;
    roi: { x: number; y: number; w: number; h: number };
}
const VideoROI = memo(
    ({ videoRef, containerRef, resolution, roi }: VideoROIProps) => {
        const [showROI, setShowROI] = useState(false);
        const toggleShowROI = () => {
            setShowROI(!showROI);
        };
        const [oriWidth] = resolution.split("x").map((i) => Number(i));
        const [convertedROI, setConvertedROI] = useState(roi);
        function calcROI(videoRef: React.RefObject<HTMLVideoElement | null>) {
            if (videoRef.current !== null) {
                //目前只考虑宽屏视频，高为主的不管了
                const { width: nowWidth, height: nowHeight } =
                    videoRef.current.getBoundingClientRect();
                const actualVideoHeight = (nowWidth * 9) / 16;
                const topShift = (nowHeight - actualVideoHeight) / 2;
                const now_ori_ratio = nowWidth / (oriWidth + 1e-6);
                setConvertedROI({
                    w: Math.round(roi.w * now_ori_ratio),
                    h: Math.round(roi.h * now_ori_ratio),
                    x: Math.round(roi.x * now_ori_ratio),
                    y: topShift + Math.round(roi.y * now_ori_ratio),
                });
            }
        }

        useEffect(() => {
            calcROI(videoRef);
        }, [oriWidth, roi, videoRef]);
        useEffect(() => {
            const f = () => {
                calcROI(videoRef);
            };
            window.addEventListener("resize", f);
            document.addEventListener("fullscreenchange", f);
            return () => {
                window.removeEventListener("resize", f);
                document.removeEventListener("fullscreenchange", f);
            };
        });
        return (
            <>
                <div
                    className="w-[50px] h-[22px] cursor-pointer text-center text-highlight relative group"
                    onClick={toggleShowROI}
                >
                    <div className="absolute -top-14 text-sm whitespace-nowrap bg-black text-white p-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none">
                        显示关注区域
                    </div>

                    <TargetIcon className="w-full h-full scale-90" />
                </div>

                {/* 通过 React Portal 在 containerRef 内部创建 ROI */}
                {showROI &&
                    containerRef.current &&
                    ReactDOM.createPortal(
                        <div
                            className="absolute z-[30] w-[100px] h-[100px] border-2 border-[#fb2c36] bg-transparent pointer-events-none"
                            style={{
                                top: convertedROI.y,
                                left: convertedROI.x,
                                width: convertedROI.w,
                                height: convertedROI.h,
                            }}
                        ></div>,
                        containerRef.current,
                    )}
            </>
        );
    },
);
VideoROI.displayName = "VideoROI";
export default VideoROI;

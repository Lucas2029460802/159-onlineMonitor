import { HTMLProps, useEffect, useRef, useState } from "react";

import { SrsRtcPlayerAsync } from "../../people-count/components/Srs_ts";
import Loading from "../../people-count/components/status/loading";

import PauseIcon from "@/pages/video-player/assets/pause.svg?react";
import PlayIcon from "@/pages/video-player/assets/play.svg?react";
import VideoFullScreen from "@/pages/video-player/components/video-fullscreen";
import VideoVolumn from "@/pages/video-player/components/video-volumn";
interface WebRTCPlayerProps extends HTMLProps<HTMLVideoElement> {
    url: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function PreviewWebRTCPlayer({
    url,
    videoRef,
    ...rest
}: WebRTCPlayerProps) {
    const sdkRef = useRef<SrsRtcPlayerAsync | null>(null);
    useEffect(() => {
        if (!videoRef.current || url === "") return;

        // 创建 SDK 实例
        sdkRef.current = new SrsRtcPlayerAsync();
        // 将流绑定到 video
        videoRef.current.srcObject = sdkRef.current.stream;
        // 播放指定 URL
        sdkRef.current.play(url);
        return () => {
            // 卸载时关闭 player
            sdkRef.current?.close();
            sdkRef.current = null;
        };
    }, [url]);

    // 视频控件
    const [isHovered, setIsHovered] = useState(false);
    const computeIsHovered = isHovered;

    const [isFullScreen, setIsFullScreen] = useState(false);
    const isFullScreenRef = useRef(isFullScreen);
    useEffect(() => {
        isFullScreenRef.current = isFullScreen;
    }, [isFullScreen]); // 方便callback拿到最新值

    const hoveredTimer = useRef(-1);

    const [isPaused, setIsPaused] = useState(false);

    const togglePlayPause = () => {
        setIsPaused((prev) => !prev);
    };
    useEffect(() => {
        if (isPaused) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
    }, [isPaused, videoRef]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [volumn, setVolumn] = useState(1);

    const [loading, setLoading] = useState(true);

    return (
        <div
            className="relative w-full h-full"
            ref={containerRef}
            onMouseMove={() => {
                setIsHovered(true);
                clearTimeout(hoveredTimer.current);
                hoveredTimer.current = setTimeout(() => {
                    setIsHovered(false);
                }, 2000);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                {...rest}
                onClick={togglePlayPause}
                onCanPlay={() => {
                    setLoading(false);
                }}
                onError={() => {
                    console.log("video cannot play");
                }}
            />
            {loading && (
                <div className="absolute top-0 left-0 w-full h-full">
                    <Loading transparent={false} />
                </div>
            )}

            <div
                id="dml-player-control"
                className={`absolute bottom-0 left-0 w-full h-[55px] z-20
                       px-3 transition-opacity duration-300 
                    ${computeIsHovered ? "opacity-100" : "opacity-0"} text-white 
                    ${isFullScreen ? "h-[73px]" : "h-[55px]"}
                    flex justify-between items-center`}
                onMouseEnter={() => {
                    clearTimeout(hoveredTimer.current);
                    setIsHovered(true);
                }}
                onMouseMove={(e) => {
                    e.stopPropagation();
                }} // 防止触发父元素move
            >
                <div
                    id="dml-control-left"
                    className=" h-10 flex items-center  pl-2 pr-3 relative bg-black/40 rounded-lg  "
                >
                    <div
                        id="dml-control-playswitch"
                        className="w-9 h-6 mr-2 cursor-pointer "
                        onClick={() => {
                            togglePlayPause();
                        }}
                    >
                        {isPaused ? <PlayIcon /> : <PauseIcon />}
                    </div>
                </div>
                <div id="dml-control-right" className=" h-10 flex items-center">
                    <VideoVolumn volumn={volumn} setVolumn={setVolumn} />

                    <VideoFullScreen
                        containerRef={containerRef}
                        isFull={isFullScreen}
                        setIsFull={setIsFullScreen}
                    />
                </div>
            </div>
            <div
                id="dml-player-mask"
                style={{
                    background:
                        "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==) repeat-x bottom",
                }}
                className={`absolute left-0 bottom-0 h-25 w-full z-10
                   pointer-events-none 
                   transition-opacity duration-200 ${computeIsHovered ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    );
}

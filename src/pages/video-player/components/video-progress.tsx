import { MouseEventHandler, useEffect, useState } from "react";

interface VideoProgressProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    duration: number;
    currentTime: number;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function VideoProgress({
    videoRef,
    duration,
    currentTime,
    setCurrentTime,
    setIsPaused,
}: VideoProgressProps) {
    const [bufferedTime, setBufferedTime] = useState(0); // 缓冲进度时间
    const videoJump: MouseEventHandler<HTMLDivElement> = (e) => {
        if (!videoRef.current) return;
        const progressBar = e.currentTarget;
        const clickPosition =
            e.clientX - progressBar.getBoundingClientRect().left;
        const newTime = (clickPosition / progressBar.offsetWidth) * duration;
        setCurrentTime(newTime);
        videoRef.current.currentTime = newTime;
        videoRef.current.play();
        setIsPaused(false);
    };
    useEffect(() => {
        if (videoRef.current === null) return;
        const interval = setInterval(() => {
            const buffered = videoRef.current!.buffered;
            // 寻找最近的bufferrange
            if (buffered.length > 0) {
                let closestBufferedEnd = 0;
                let smallestDiff = Infinity;
                for (let i = 0; i < buffered.length; i++) {
                    const startBuffered = buffered.start(i);
                    const endBuffered = buffered.end(i);
                    const diff = Math.abs(
                        videoRef.current!.currentTime - startBuffered,
                    );
                    if (diff < smallestDiff) {
                        smallestDiff = diff;
                        closestBufferedEnd = endBuffered;
                    }
                }
                setBufferedTime(closestBufferedEnd);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div
            id="dml-progress-bar-wrap"
            className="w-full h-1  bg-transparent absolute top-0 left-0 px-3 z-75 "
        >
            <div
                id="dml-progress-bar-area"
                className="w-full h-1 hover:scale-y-150 bg-[#16161633] relative cursor-pointer origin-center "
                onClick={videoJump}
            >
                <div
                    id="dml-progress-bar-buffer"
                    className=" bg-[#3030304D]  absolute top-0 bottom-0 left-0 right-0 origin-top-left "
                    style={{
                        transform: `scaleX(${bufferedTime / (duration + 1e-3)})`,
                    }}
                ></div>
                <div
                    id="dml-progress-bar-current"
                    className="bg-[#00a1d6] absolute top-0 bottom-0 left-0 right-0 origin-top-left"
                    style={{
                        transform: `scaleX(${currentTime / (duration + 1e-3)})`,
                    }}
                ></div>
            </div>
        </div>
    );
}

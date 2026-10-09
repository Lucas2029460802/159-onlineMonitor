import { useEffect } from "react";

import FullScreenIcon from "../assets/fullscreen.svg?react";
interface VideoFullScreenProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    isFull: boolean;
    setIsFull: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function VideoFullScreen({
    containerRef,
    isFull,
    setIsFull,
}: VideoFullScreenProps) {
    const toggleFullScreen = () => {
        if (containerRef.current !== null) {
            if (isFull) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };
    const handleFullScreenChange = () => {
        setIsFull((prev) => !prev);
    };
    useEffect(() => {
        const container = containerRef.current;
        if (container !== null) {
            document.addEventListener(
                "fullscreenchange",
                handleFullScreenChange,
            );
        }
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullScreenChange,
            );
        };
    }, []);

    return (
        <div
            className="w-[50px] h-[22px] cursor-pointer text-center text-highlight relative group"
            onClick={toggleFullScreen}
        >
            <div
                className="absolute -top-12  text-sm whitespace-nowrap bg-black text-white p-2 left-1/2 -translate-x-1/2 
            opacity-0 group-hover:opacity-100 pointer-events-none"
            >
                进入全屏
            </div>

            <FullScreenIcon />
        </div>
    );
}

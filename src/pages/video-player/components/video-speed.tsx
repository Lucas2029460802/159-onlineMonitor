import { useState } from "react";
interface VideoSpeedProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}
export default function VideoSpeed({ videoRef }: VideoSpeedProps) {
    const [isDivHovered, setIsDivHovered] = useState(false);
    const [isUlHovered, setIsUlHovered] = useState(false);
    const [playbackRate, setPlayBackRate] = useState(1);
    const speedList = [0.5, 1, 2, 4, 8].map((speed) => ({
        spd: speed,
        description: speed.toFixed(1) + "x",
    }));
    const changeSpeed = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlayBackRate(speed);
            setIsDivHovered(false);
            setIsUlHovered(false);
        }
    };
    return (
        <div
            className="w-[50px] cursor-pointer relative text-center z-[100] "
            onMouseEnter={() => {
                setIsDivHovered(true);
            }}
            onMouseLeave={() => {
                setIsDivHovered(false);
            }}
        >
            {playbackRate === 1 ? "倍速" : playbackRate.toFixed(1) + "x"}
            {(isDivHovered || isUlHovered) && (
                <ul
                    className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col-reverse  w-[140%] text-center 
                shadow-lg  text-white "
                    onMouseEnter={() => {
                        setIsUlHovered(true);
                    }}
                    onMouseLeave={() => {
                        setIsUlHovered(false);
                    }}
                >
                    <div className="h-[20px] bg-transparent cursor-default"></div>
                    {speedList.map((speed, index) => (
                        <li
                            key={index}
                            className={`h-9 leading-9 text-sm bg-[hsla(0,0%,8%,0.9)] hover:bg-[rgb(44,44,44)] 
                            ${index === 0 ? "rounded-b-sm" : " "}
                            ${index === speedList.length - 1 ? "rounded-t-sm" : " "}`}
                            onClick={() => {
                                changeSpeed(speed.spd);
                            }}
                        >
                            {speed.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

import { useState } from "react";
import { twMerge } from "tailwind-merge";

import SkipIcon from "../assets/skip.svg?react";
interface VideoSkipProps {
    setShouldSkip: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function VideoSkip({ setShouldSkip }: VideoSkipProps) {
    const [clicked, setClicked] = useState(false);
    return (
        <div
            className="w-[50px] h-[22px] cursor-pointer text-center text-highlight relative group"
            onClick={() => {
                setShouldSkip(!clicked);
                setClicked((prev) => !prev);
            }}
        >
            <div className="absolute -top-14 text-sm whitespace-nowrap bg-black text-white p-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none">
                只播放有事件片段
            </div>

            <SkipIcon
                className={twMerge(
                    `w-full h-full scale-90`,
                    clicked ? "fill-blue-2" : "fill-white",
                )}
            />
        </div>
    );
}

import React, { MouseEvent, useEffect, useRef, useState } from "react";

import VolumnMuteIcon from "../assets/volumn-mute.svg?react";
import VolumnIcon from "../assets/volumn.svg?react";
import { calcPercent, clamp } from "../util";
interface VideoVolumnProps {
    volumn: number;
    setVolumn: React.Dispatch<React.SetStateAction<number>>;
}

export default function VideoVolumn({ volumn, setVolumn }: VideoVolumnProps) {
    const thumbAreaRef = useRef<HTMLDivElement>(null);
    const [isDivHovered, setIsDivHovered] = useState(false);
    const ballRaidus = 6;
    const sliderHeight = 60;
    const [dragging, setDragging] = useState(false);
    const [topPosition, setTopPosition] = useState(0);
    const memVolumn = useRef(volumn);
    const memTopPos = useRef(topPosition);
    const handleMouseDown = () => {
        setDragging(true);
    };
    const handleMouseUp = () => {
        setDragging(false);
    };
    const handleClick = (e: MouseEvent) => {
        if (thumbAreaRef.current === null) return;
        setTopPosAndVolumn(e);
    };
    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging || thumbAreaRef.current === null) return;
        setTopPosAndVolumn(e);
    };
    const setTopPosAndVolumn = (e: MouseEvent) => {
        let deltaY =
            e.clientY - thumbAreaRef.current!.getBoundingClientRect().top;
        deltaY = clamp(deltaY, 0, sliderHeight - 2 * ballRaidus);
        const volumnPercent =
            1 - calcPercent(deltaY, 0, sliderHeight - 2 * ballRaidus);
        setVolumn(volumnPercent);
    };
    const iconToggle = () => {
        if (volumn !== 0) {
            memVolumn.current = volumn;
            memTopPos.current = topPosition;
            setVolumn(Math.round(0));
            setTopPosition(sliderHeight - 2 * ballRaidus);
        } else {
            setVolumn(memVolumn.current);
            setTopPosition(memTopPos.current);
        }
    };
    useEffect(() => {
        setTopPosition((sliderHeight - 2 * ballRaidus) * (1 - volumn));
    }, [volumn]);

    return (
        <div
            className="w-[50px] h-[22px] cursor-pointer relative text-center  "
            onMouseEnter={() => {
                setIsDivHovered(true);
            }}
            onMouseLeave={() => {
                setIsDivHovered(false);
            }}
        >
            {Math.abs(volumn) >= 1e-6 ? (
                <VolumnIcon onClick={iconToggle} />
            ) : (
                <VolumnMuteIcon onClick={iconToggle} />
            )}
            {isDivHovered && (
                <div
                    id="dml-slider"
                    className="
                h-[121px] w-8 absolute bottom-full left-1/2 -translate-x-1/2
                 flex flex-col-reverse z-[100]
                 "
                >
                    <div
                        id="slider-occupy"
                        className="w-full h-[21px] cursor-default"
                    ></div>
                    <div
                        id="slider-main"
                        className="w-full h-[100px] bg-[rgba(20,20,20,0.9)] flex flex-col"
                    >
                        <div
                            id="dml-show-number"
                            className="h-7 mb-0.5 leading-7 text-xs cursor-default select-none"
                        >
                            {Math.round(volumn * 100)}
                        </div>
                        <div
                            id="dml-thumb-area"
                            className="h-15 flex relative"
                            ref={thumbAreaRef}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            onClick={handleClick}
                        >
                            <div
                                id="slider-vertical-line"
                                className="w-0.5 h-full bg-white mx-auto rounded-xs"
                            ></div>
                            <div
                                id="slider-ball"
                                className="w-3 h-3 rounded-full bg-[#00AEEC] absolute left-1/2 -translate-x-1/2  cursor-pointer"
                                style={{
                                    top: topPosition,
                                }}
                            ></div>
                            <div
                                id="slider-blue-bar"
                                className="absolute left-1/2 -translate-x-1/2 bg-[#00AEEC] w-0.5"
                                style={{
                                    height: `${60 - topPosition}px`, // 控制蓝色条的高度
                                    bottom: "0", // 使其底部对齐
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

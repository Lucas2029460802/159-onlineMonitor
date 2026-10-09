import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";

import { SearchTarget } from "../new-big-pic";

import { urlPicGenre } from "@/pages/bigpic";

type PicGenreToggleProps = {
    newSearchNavi: (newTarget: Partial<SearchTarget>) => void;
    genre: urlPicGenre;
    isFace: boolean;
    count: {
        png: number | null;
        gif: number | null;
        face: number | null;
    };
    setSearchKeywords: React.Dispatch<React.SetStateAction<string>>;
};
const ref_dist = {
    png: 0,
    gif: 10,
    face: 10,
};

const PicGenreToggle: React.FC<PicGenreToggleProps> = ({
    newSearchNavi,
    genre,
    isFace,
    count,
    setSearchKeywords,
}) => {
    const [active, setActive] = useState<urlPicGenre>(isFace ? "face" : genre);
    const pngRef = useRef<HTMLLIElement>(null);
    const gifRef = useRef<HTMLLIElement>(null);
    const faceRef = useRef<HTMLLIElement>(null);
    const refMap = new Map<urlPicGenre, React.RefObject<HTMLLIElement | null>>([
        ["png", pngRef],
        ["gif", gifRef],
        ["face", faceRef],
    ]);
    const sliderRef = useRef<HTMLDivElement>(null);

    const moveSlider = () => {
        const activeRef = refMap.get(active)?.current;
        const slider = sliderRef.current;
        if (activeRef && slider) {
            const left = activeRef.offsetLeft;
            slider.style.transform = `translateX(${left + ref_dist[active]}px)`;
        }
    };
    const [showCount, setShowCount] = useState(false);

    useEffect(() => {
        setShowCount(false);
        moveSlider();
        setTimeout(() => {
            setShowCount(true);
        }, 250);
        window.addEventListener("resize", moveSlider);
        return () => window.removeEventListener("resize", moveSlider);
    }, [active]);

    const renderItem = (
        label: string,
        type: urlPicGenre,
        refEl: React.RefObject<HTMLLIElement | null>,
    ) => (
        <li
            ref={refEl}
            className={twMerge(
                "w-18 cursor-pointer  py-[5px] relative",
                type === "png" ? "pr-[10px]" : "px-[10px]",
            )}
            onClick={() => {
                setActive(type);
                if (type === "png" || type === "gif") {
                    const navi: Partial<SearchTarget> = {
                        curPage: 1,
                        curPicGenre: type,
                        curEvtType: "all",
                    };

                    newSearchNavi(navi);
                } else {
                    const navi: Partial<SearchTarget> = {
                        curPage: 1,
                        curPicGenre: "png",
                        curEvtType: "face",
                    };
                    newSearchNavi(navi);
                }
            }}
        >
            <span
                className={`block w-12 transition text-center ${
                    active === type
                        ? "text-[#00AEEC]"
                        : "text-gray-800 hover:text-[#00AEEC]"
                }`}
            >
                {label}
            </span>
            {/* 右上角数字 */}
            {active === type && count[type] !== null && showCount && (
                <span className="absolute -top-1 -right-1 bg-[#00AEEC] text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {count[type]}
                </span>
            )}
        </li>
    );

    return (
        <div className="relative w-fit">
            <ul className="flex gap-4 relative">
                {renderItem("静态图", "png", pngRef)}
                {renderItem("动态图", "gif", gifRef)}
                {renderItem("人脸图", "face", faceRef)}
            </ul>
            {/* 底部滑块 */}
            <div
                ref={sliderRef}
                className="absolute bottom-0 left-0 bg-[rgb(0,174,236)] w-12 h-0.5 rounded-xs transition-transform duration-300 ease-in-out"
            />
        </div>
    );
};

export default PicGenreToggle;

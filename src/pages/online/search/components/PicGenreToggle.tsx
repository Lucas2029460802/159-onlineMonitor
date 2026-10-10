import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { SearchMediaGenre } from "@/api/type";

type PicGenreToggleProps = {
    genre: SearchMediaGenre;
    onChange: (genre: SearchMediaGenre) => void;
};

const ITEMS: { label: string; type: SearchMediaGenre }[] = [
    { label: "静态图", type: "png" },
    { label: "动态图", type: "gif" },
];

export default function PicGenreToggle({
    genre,
    onChange,
}: PicGenreToggleProps) {
    const pngRef = useRef<HTMLLIElement>(null);
    const gifRef = useRef<HTMLLIElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState<SearchMediaGenre>(genre);

    useEffect(() => {
        setActive(genre);
    }, [genre]);

    const moveSlider = () => {
        const activeRef = active === "png" ? pngRef.current : gifRef.current;
        const slider = sliderRef.current;
        if (activeRef && slider) {
            slider.style.transform = `translateX(${activeRef.offsetLeft}px)`;
        }
    };

    useEffect(() => {
        moveSlider();
        window.addEventListener("resize", moveSlider);
        return () => window.removeEventListener("resize", moveSlider);
    }, [active]);

    return (
        <div className="relative w-fit">
            <ul className="flex gap-4 relative">
                {ITEMS.map(({ label, type }) => (
                    <li
                        key={type}
                        ref={type === "png" ? pngRef : gifRef}
                        className={twMerge(
                            "w-18 cursor-pointer py-[5px] relative",
                            type === "png" ? "pr-[10px]" : "px-[10px]",
                        )}
                        onClick={() => {
                            setActive(type);
                            onChange(type);
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
                    </li>
                ))}
            </ul>
            <div
                ref={sliderRef}
                className="absolute bottom-0 left-0 bg-[rgb(0,174,236)] w-12 h-0.5 rounded-xs transition-transform duration-300 ease-in-out"
            />
        </div>
    );
}

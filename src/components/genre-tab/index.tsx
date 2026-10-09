import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { twMerge } from "tailwind-merge";

export type TabItem = {
    /** 标签唯一标识 */
    key: string;
    /** 标签显示文字 */
    label: string;
    /** 计数（可选） */
    count?: number | null;
    /** 自定义偏移微调（可选） */
    offset?: number;
};

type TabToggleProps = {
    /** 标签列表 */
    tabs: TabItem[];
    /** 初始选中项 */
    defaultActiveKey?: string;
    /** 切换时回调 */
    onChange?: (activeKey: string) => void;
    /** 是否显示计数 */
    showCount?: boolean;
    /** className 用于外部定制样式 */
    className?: string;
};

/**
 * 通用 Tab 切换组件（带滑块动画）
 */
const GenreTab: React.FC<TabToggleProps> = ({
    tabs,
    defaultActiveKey,
    onChange,
    showCount = true,
    className,
}) => {
    const [active, setActive] = useState<string>(
        defaultActiveKey ?? tabs[0]?.key ?? "",
    );
    useEffect(() => {
        setActive(defaultActiveKey ?? tabs[0]?.key ?? "");
    }, [defaultActiveKey, tabs]);
    const [showCountState, setShowCountState] = useState(true);
    const timer = useRef<number | undefined>(undefined);
    const refs = useRef(new Map<string, HTMLLIElement | null>());
    const [activeEle, setActiveEle] = useState<HTMLLIElement | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const moveSlider = () => {
        const slider = sliderRef.current;
        if (activeEle && slider) {
            const offset = tabs.find((t) => t.key === active)?.offset ?? 0;
            const left = activeEle.offsetLeft + offset;
            slider.style.transform = `translateX(${left}px)`;
            slider.style.width = `${activeEle.offsetWidth - 20}px`;
        }
    };
    useEffect(() => {
        if (active === "" && tabs.length >= 1) {
            setActive(tabs[0].key);
        }
    }, [tabs]);
    useLayoutEffect(() => {
        const el = refs.current.get(active);

        if (el && sliderRef.current) {
            const offset = tabs.find((t) => t.key === active)?.offset ?? 0;
            const left = el.offsetLeft + offset;
            sliderRef.current.style.transform = `translateX(${left}px)`;
            sliderRef.current.style.width = `${el.offsetWidth - 20}px`;
        }
        setActiveEle(refs.current.get(active) || null);
    }, [active, tabs]);

    useEffect(() => {
        moveSlider();
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setShowCountState(true), 250);

        window.addEventListener("resize", moveSlider);
        return () => {
            if (timer.current) clearTimeout(timer.current);
            window.removeEventListener("resize", moveSlider);
        };
    }, [active, tabs]);

    const handleClick = (key: string) => {
        if (key === active) return;
        setActive(key);
        setShowCountState(false);
        setActiveEle(refs.current.get(key) || null);
        onChange?.(key);
    };

    return (
        <div className={twMerge("relative w-fit", className)}>
            <ul className="flex gap-4 relative">
                {tabs.map((tab) => (
                    <li
                        key={tab.key}
                        ref={(el) => {
                            refs.current.set(tab.key, el);
                        }}
                        onClick={() => handleClick(tab.key)}
                        className={twMerge(
                            "cursor-pointer py-[5px] relative px-[10px]",
                        )}
                    >
                        <span
                            className={twMerge(
                                "block  text-center transition",
                                active === tab.key
                                    ? "text-[#00AEEC]"
                                    : "text-gray-800 hover:text-[#00AEEC]",
                            )}
                        >
                            {tab.label}
                        </span>
                        {showCount &&
                            showCountState &&
                            active === tab.key &&
                            tab.count !== null &&
                            tab.count !== undefined && (
                                <span className="absolute -top-1 -right-1 bg-[#00AEEC] text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                                    {tab.count}
                                </span>
                            )}
                    </li>
                ))}
            </ul>
            <div
                ref={sliderRef}
                className="absolute bottom-0 left-0 bg-[rgb(0,174,236)] w-12 h-0.5 rounded-xs  transition-all duration-300 ease-in-out"
            />
        </div>
    );
};

export default GenreTab;

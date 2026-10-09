import React, {
    useState,
    ReactElement,
    cloneElement,
    isValidElement,
    useEffect,
    useRef,
    HTMLProps,
} from "react";
import { twMerge } from "tailwind-merge";

import { IconSelectorDrop } from "@/assets/svg";
export interface SelectorChildProps extends HTMLProps<HTMLDivElement> {
    labelTobeSelect: string; // 在下拉框展开后选项中的文字
    labelToShow?: string; // 选好之后最外层就能看到的文字
    onClick?: (e: React.MouseEvent) => void;
}
interface SelectorProps {
    children: ReactElement<SelectorChildProps>[];
    defaultLabel?: string;
    disabled?: boolean;
    containerClassName?: string;
    contentDescriptor?: string;
}

export const Selector: React.FC<SelectorProps> = ({
    children,
    defaultLabel = "请选择按真实时间的排序顺序",
    disabled = false,
    containerClassName,
    contentDescriptor,
}) => {
    const [open, setOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(defaultLabel);
    const containerRef = useRef<HTMLDivElement>(null);
    const hoverOpenTimeoutRef = useRef<number | null>(null);
    const hoverCloseTimeoutRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (disabled) return;

        // 清除关闭的定时器
        if (hoverCloseTimeoutRef.current) {
            clearTimeout(hoverCloseTimeoutRef.current);
            hoverCloseTimeoutRef.current = null;
        }

        // 开启打开定时器
        hoverOpenTimeoutRef.current = setTimeout(() => {
            setOpen(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        // 清除打开的定时器（还没触发就离开）
        if (hoverOpenTimeoutRef.current) {
            clearTimeout(hoverOpenTimeoutRef.current);
            hoverOpenTimeoutRef.current = null;
        }

        // 延迟关闭
        hoverCloseTimeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 300);
    };
    const handleSelect = (child: ReactElement<SelectorChildProps>) => {
        return (e: React.MouseEvent) => {
            e.stopPropagation();
            setOpen(false);
            const label = (
                child.props.labelToShow || child.props.labelTobeSelect
            ).toString();
            setSelectedLabel(label);
            if (child.props.onClick) {
                child.props.onClick(e);
            }
        };
    };
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div
            className={twMerge(
                "relative inline-block ml-6",
                containerClassName,
            )}
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={twMerge(
                    "px-[15px] h-8 text-sm rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center ",
                    "text-[#00AEEC] bg-[#DFF6FD]",
                    // open
                    //     ? "text-[#00AEEC] bg-[#DFF6FD]"
                    //     : "text-[#61666D] bg-transparent",
                    // "hover:text-[#00AEEC] hover:bg-[#DFF6FD]",
                )}
                style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (disabled) return;
                    // setOpen((prev) => !prev);
                    setOpen(true);
                }}
            >
                <span>
                    {contentDescriptor ?? ""}
                    {selectedLabel}
                </span>

                <span className="w-4 h-4 ml-1 ">
                    <IconSelectorDrop />
                </span>
            </div>

            {open && (
                <div
                    className="absolute z-10 mt-1 py-2 w-full rounded-lg border border-gray-1 bg-white shadow-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children.map((child, index) =>
                        isValidElement(child)
                            ? cloneElement(child, {
                                  key: index,
                                  onClick: handleSelect(child),
                                  className: twMerge(
                                      "px-3 h-8 text-sm leading-8 cursor-pointer hover:bg-[#DFF6FD] hover:text-[#00AEEC] transition-colors",
                                      "text-[#61666D]",
                                      child.props.className,
                                  ),
                              })
                            : null,
                    )}
                </div>
            )}
        </div>
    );
};

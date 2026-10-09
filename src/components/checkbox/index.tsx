import { FC, HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { IconCheck } from "@/assets/svg";

export interface CheckBoxProps extends HTMLProps<HTMLDivElement> {
    checked?: boolean;
    type?: "single" | "multi";
}

export const CheckBox: FC<CheckBoxProps> = (props) => {
    const { checked = false, children, type = "single", ...rest } = props;
    return (
        <div
            className={twMerge(
                "flex items-center justify-center gap-1.5 select-none cursor-pointer text-sm",
                checked ? "text-blue-1" : "text-text-1",
            )}
            {...rest}
        >
            <div
                className={twMerge(
                    "border border-solid border-[#bec3cc] rounded-full w-4 h-4 box-content",
                    type === "single" && "rounded-full",
                    type === "multi" && "rounded-xs hover:border-blue-1",
                    checked && type === "multi" && "border-blue-1",
                )}
            >
                <div
                    className={twMerge(
                        "relative bg-blue-1 transition-all flex items-center justify-center",
                        checked ? "scale-100" : "scale-0",
                        type === "single" &&
                            "rounded-full left-0.5 top-0.5 w-3 h-3",
                        type === "multi" && "left-0 top-0 w-full h-full",
                    )}
                >
                    {type === "multi" && <IconCheck className="text-white" />}
                </div>
            </div>
            {children}
        </div>
    );
};

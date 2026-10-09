import React, { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

interface ProgressBarProps extends HTMLProps<HTMLDivElement> {
    progress: number;
    color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className,
    color,
    ...rest
}) => {
    return (
        <div
            className={twMerge(
                "relative w-full h-[3px] bg-gray-1 rounded-sm overflow-hidden",
                className,
            )}
            {...rest}
        >
            <div
                className="absolute h-full z-20 bg-blue-1"
                style={{
                    width: `${progress}%`,
                    backgroundColor: color,
                }}
            />
        </div>
    );
};

export default ProgressBar;

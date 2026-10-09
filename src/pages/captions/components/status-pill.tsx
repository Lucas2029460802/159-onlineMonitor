import { Tooltip } from "antd";
import { FC } from "react";
import { twMerge } from "tailwind-merge";

interface StatusPillProps {
    text: string;
    tone: "gray" | "blue" | "green" | "red";
    tooltip?: string;
}

const toneClassName: Record<StatusPillProps["tone"], string> = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-sky-100 text-sky-700 border-sky-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
};

export const StatusPill: FC<StatusPillProps> = ({ text, tone, tooltip }) => {
    const content = (
        <span
            className={twMerge(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                toneClassName[tone],
            )}
        >
            {text}
        </span>
    );

    if (!tooltip) return content;

    return <Tooltip title={tooltip}>{content}</Tooltip>;
};

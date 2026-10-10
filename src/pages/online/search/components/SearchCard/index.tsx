import { Tooltip } from "antd";
import { HTMLProps, MouseEventHandler } from "react";

import IconLocation from "../../svg/icon-location.svg?react";
import IconTime from "../../svg/icon-time.svg?react";
import { onlineEventMediaUrl } from "../../util/media";

import { date2ChineseString } from "@/util/time";

export interface SearchCardProps extends HTMLProps<HTMLDivElement> {
    time: Date;
    location: string;
    /** 相对路径，经 online event screenshot 接口读取 */
    imagePath: string;
    hitString: string;
    tag?: string[];
    onClick: () => MouseEventHandler<HTMLDivElement> | undefined;
}

function shortLocation(location: string) {
    if (!location) return "未知地点";
    if (location.length <= 20) return location;
    const parts = location.split("-");
    if (parts.length >= 2) {
        return `…${parts[0].slice(-6)}-…${parts[1].slice(-6)}`;
    }
    return `${location.slice(0, 8)}…${location.slice(-6)}`;
}

export default function SearchCard({
    time,
    location,
    imagePath,
    tag,
    onClick,
}: SearchCardProps) {
    const primaryTag = tag?.[0];

    return (
        <div
            className="group flex flex-col rounded-2xl border border-[#e8ecf0] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)] hover:border-[#b6e6f6] transition-all duration-200 cursor-pointer"
            onClick={onClick}
        >
            <div className="relative aspect-[16/10] bg-[#eef1f4] overflow-hidden">
                <img
                    src={onlineEventMediaUrl(imagePath)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                />
                {primaryTag && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/55 text-white text-[11px] backdrop-blur-sm">
                        {primaryTag}
                    </span>
                )}
            </div>

            <div className="px-3 py-2.5 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[12px] text-[#8b929a] min-w-0">
                    <IconTime className="w-3.5 h-3.5 shrink-0 text-[#a0a7b0]" />
                    <span className="truncate">{date2ChineseString(time)}</span>
                </div>
                <Tooltip title={location || "未知地点"}>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#55acee] min-w-0">
                        <IconLocation className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                            {shortLocation(location)}
                        </span>
                    </div>
                </Tooltip>
            </div>
        </div>
    );
}

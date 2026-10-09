import { Tag, Tooltip } from "antd";
import { HTMLProps, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";

import LazyImage from "@/components/image";
import { svStrategy } from "@/pages/online/types";
import { date2ChineseString } from "@/util/time";

export interface AlertCardProps extends HTMLProps<HTMLDivElement> {
    time: Date;
    location: string;
    strategy: svStrategy;
    dealt: boolean;
    url: string;
    onClick: () => MouseEventHandler<HTMLDivElement> | undefined;
}
export default function AlertCard({
    time,
    location,
    strategy,
    dealt,
    url,
    onClick,
}: AlertCardProps) {
    return (
        <div>
            <LazyImage
                onClick={onClick}
                src={`/api/video/online/alarm/screenshot?image_path=${url}`}
                className="aspect-video bg-[#d1d5dc] flex items-center justify-center  cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform rounded-md overflow-hidden"
            >
                <div className="absolute top-2 right-1">
                    <Tag color={!dealt ? "#cd201f" : "#55acee"}>
                        {!dealt ? "未处理" : "已处理"}
                    </Tag>
                </div>
                <div
                    className={twMerge(
                        "absolute left-0 bottom-0 z-[2] w-full h-[30px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] px-2 pt-2 pb-1.5",
                        "flex justify-end items-center",

                        "opacity-100",
                    )}
                >
                    <div className="text-[13px] leading-[18px] text-white">
                        {date2ChineseString(time)}
                    </div>
                </div>
            </LazyImage>

            <div className="mt-1 h-8  box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer flex items-center ">
                <div className="mr-1  h-full p-2 bg-[#dff6fd] text-sm rounded-md flex justify-center items-center text-[#00aeec] shrink-0 text-[13px]">
                    {strategy}
                </div>
                <Tooltip title={location}>
                    <div className="flex-1 text-[13px] text-[#35373b] truncate text-right pr-2">
                        {location}
                    </div>
                </Tooltip>
            </div>
        </div>
    );
}

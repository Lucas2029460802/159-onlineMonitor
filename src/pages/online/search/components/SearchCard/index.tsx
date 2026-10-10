import { Tag, Tooltip } from "antd";
import { HTMLProps, MouseEventHandler } from "react";

import IconLocation from "../../svg/icon-location.svg?react";
import IconTime from "../../svg/icon-time.svg?react";
import { onlineEventMediaUrl } from "../../util/media";

import LazyImage from "@/components/image";
import { date2ChineseString } from "@/util/time";

export interface SearchCardProps extends HTMLProps<HTMLDivElement> {
    time: Date;
    location: string;
    /** 相对路径，经 online event screenshot 接口读取 */
    imagePath: string;
    hitString: string;
    caption?: string;
    tag?: string[];
    onClick: () => MouseEventHandler<HTMLDivElement> | undefined;
}

export default function SearchCard({
    time,
    location,
    hitString,
    imagePath,
    caption,
    tag,
    onClick,
}: SearchCardProps) {
    return (
        <div className="flex flex-col">
            <LazyImage
                onClick={onClick}
                src={onlineEventMediaUrl(imagePath)}
                className="aspect-video bg-[#d1d5dc] flex items-center justify-center cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform rounded-md overflow-hidden relative"
            ></LazyImage>

            <div className="flex flex-col mt-2 px-0.5 gap-y-2">
                <div className="text-[13px] text-[#55acee] leading-[18px] h-[18px]">
                    <div className="flex h-full gap-x-1.5">
                        <IconLocation className="h-full text-[#55acee] scale-1.5" />
                        {location}
                    </div>
                </div>
                <div className="text-[13px] leading-[18px] text-[#9499a0] h-[18px]">
                    <div className="flex h-full gap-x-1.5">
                        {<IconTime className="h-full" />}
                        {date2ChineseString(time)}
                    </div>
                </div>
                {tag && tag.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tag.slice(0, 3).map((t) => (
                            <Tag key={t} color="blue" className="m-0 text-[11px]">
                                {t}
                            </Tag>
                        ))}
                    </div>
                )}
                {caption ? (
                    <Tooltip title={caption}>
                        <div className="text-[12px] text-[#61666d] line-clamp-2 leading-[16px]">
                            {caption}
                        </div>
                    </Tooltip>
                ) : null}
            </div>
            {hitString !== "" && (
                <div className="mt-1 h-8 pr-[30px] box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer flex items-center ">
                    <div className="mr-1 w-22 h-full p-2 bg-[#dff6fd] text-sm rounded-md flex justify-center items-center text-[#00aeec] shrink-0 text-[13px]">
                        命中关键词
                    </div>
                    <Tooltip title={hitString}>
                        <div className="text-[13px] text-[#9499a0] truncate">
                            {hitString}
                        </div>
                    </Tooltip>
                </div>
            )}
        </div>
    );
}

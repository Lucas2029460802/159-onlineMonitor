import { Tooltip } from "antd";

import { onlineEventMediaUrl } from "../../util/media";

import LazyImage from "@/components/image";
import { SearchMediaGenre } from "@/api/type";
import { date2ChineseString } from "@/util/time";

export interface SearchCardProps {
    time: Date;
    location: string;
    imagePath: string;
    hitString: string;
    genre: SearchMediaGenre;
    showTime: boolean;
    onClick: () => void;
}

export default function SearchCard({
    time,
    location,
    imagePath,
    hitString,
    genre,
    showTime,
    onClick,
}: SearchCardProps) {
    return (
        <div>
            <LazyImage
                onClick={onClick}
                src={onlineEventMediaUrl(imagePath)}
                className="aspect-video bg-[#d1d5dc] flex items-center justify-center cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform rounded-md overflow-hidden relative"
            >
                {showTime && (
                    <div className="absolute left-0 top-0 z-[0] w-full h-6 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] pl-1 pb-1.5 opacity-100">
                        <div className="text-white text-[14px] leading-6 truncate pr-1">
                            {date2ChineseString(time)}
                            {location ? ` · ${location}` : ""}
                        </div>
                    </div>
                )}
            </LazyImage>
            {hitString !== "" && genre === "png" && (
                <div className="mt-1 h-8 pr-[30px] box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer flex items-center">
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

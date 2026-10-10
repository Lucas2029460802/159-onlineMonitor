import React from "react";
import { twMerge } from "tailwind-merge";

import VideoSelector from "./VideoSelector";

import { RangeTimePicker } from "@/pages/bigpic/components/time-picker";
import type { TimeRange } from "@/pages/bigpic/components/grid";

type OrderShowtimeGroupProps = {
    setShowTime: (val: boolean) => void;
    showTime: boolean;
    sortOrder: number; // 0 asc, 1 desc
    sortFieldID: number; // 0 time, 1 similarity
    onSortChange: (sortOrder: number, sortFieldID: number) => void;
    timeRange: TimeRange;
    setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
    videoId: number;
    onVideoChange: (videoId: number) => void;
};

export default function OrderShowtimeGroup({
    setShowTime,
    showTime,
    sortOrder,
    sortFieldID,
    onSortChange,
    timeRange,
    setTimeRange,
    videoId,
    onVideoChange,
}: OrderShowtimeGroupProps) {
    return (
        <div
            id="order-showtime-group"
            className="flex gap-[10px] mb-[10px] text-sm min-w-[1100px] flex-wrap"
        >
            <div
                onClick={() => setShowTime(true)}
                className={`w-25 px-[15px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center ${
                    showTime
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]"
                }`}
            >
                <span>显示时间</span>
            </div>

            <div
                onClick={() => setShowTime(false)}
                className={`w-25 px-[15px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center ${
                    !showTime
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]"
                }`}
            >
                <span>隐藏时间</span>
            </div>

            <div
                onClick={() => onSortChange(0, 0)}
                className={twMerge(
                    `w-25 px-[15px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center`,
                    sortOrder === 0 && sortFieldID === 0
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]",
                )}
            >
                <span>时间升序</span>
            </div>

            <div
                onClick={() => onSortChange(1, 0)}
                className={twMerge(
                    `w-25 px-[15px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center`,
                    sortOrder === 1 && sortFieldID === 0
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]",
                )}
            >
                <span>时间降序</span>
            </div>

            <div
                onClick={() => onSortChange(1, 1)}
                className={twMerge(
                    `w-26 px-[15px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center`,
                    sortOrder === 1 && sortFieldID === 1
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]",
                )}
            >
                <span>相似度降序</span>
            </div>

            <div className="ml-3 px-[15px] h-8 rounded-lg cursor-pointer select-none leading-8">
                <RangeTimePicker
                    setTimeRange={setTimeRange}
                    value={timeRange}
                />
            </div>
            <VideoSelector value={videoId} onChange={onVideoChange} />
        </div>
    );
}

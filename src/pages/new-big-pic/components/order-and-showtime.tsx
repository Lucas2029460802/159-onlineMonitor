import React from "react";
import { twMerge } from "tailwind-merge";

import { SearchTarget, TimeRange } from "../new-big-pic";
import VideoSelector from "./videoSelector";

import { RangeTimePicker } from "@/pages/bigpic/components/time-picker";

type OrderShowtimeGroupProps = {
    setShowTime: (val: boolean) => void;
    showTime: boolean;
    newSearchNavi: (newTarget: Partial<SearchTarget>) => void;
    sortOrder: number; // 0 for asc, 1 for desc
    setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
    sortFieldID: number;
};

export const OrderShowtimeGroup: React.FC<OrderShowtimeGroupProps> = ({
    setShowTime,
    newSearchNavi,
    showTime,
    sortOrder,
    setTimeRange,
    sortFieldID,
}) => {
    // console.log("order", sortOrder, "field", sortFieldID);
    return (
        <div
            id="order-showtime-group"
            className="flex gap-[10px] mb-[10px] text-sm  min-w-[1100px]"
        >
            {/* 显示时间 */}
            <div
                onClick={() => {
                    setShowTime(true);
                }}
                className={`w-25 px-[15px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center ${
                    showTime
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]"
                }`}
            >
                <span>显示时间</span>
            </div>

            {/* 隐藏时间 */}
            <div
                onClick={() => {
                    setShowTime(false);
                }}
                className={`w-25 px-[15px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center ${
                    !showTime
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]"
                }`}
            >
                <span>隐藏时间</span>
            </div>

            {/* 升序排列 */}
            <div
                onClick={() => {
                    newSearchNavi({
                        curPage: 1,
                        sortOrder: 0,
                        sort_field_id: 0,
                    });
                }}
                className={twMerge(
                    `w-25 px-[15px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center`,
                    sortOrder === 0 && sortFieldID === 0
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]",
                )}
            >
                <span>时间升序</span>
            </div>

            {/* 降序排列 */}
            <div
                onClick={() => {
                    newSearchNavi({
                        curPage: 1,
                        sortOrder: 1,
                        sort_field_id: 0,
                    });
                }}
                className={twMerge(
                    `w-25 px-[15px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center`,
                    sortOrder === 1 && sortFieldID === 0
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]",
                )}
            >
                <span>时间降序</span>
            </div>
            {/* 文本相似度排列 */}
            <div
                onClick={() => {
                    newSearchNavi({
                        curPage: 1,
                        sortOrder: 1,
                        sort_field_id: 1,
                    });
                }}
                className={twMerge(
                    `w-26 px-[15px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center`,
                    sortOrder === 1 && sortFieldID === 1
                        ? "text-[#00AEEC] bg-[#DFF6FD]"
                        : "text-[#61666D] hover:text-[#00AEEC]",
                )}
            >
                <span>相似度降序</span>
            </div>
            <div className="ml-3 px-[15px] h-8   rounded-lg  cursor-pointer select-none leading-8">
                <RangeTimePicker setTimeRange={setTimeRange}></RangeTimePicker>
            </div>
            <VideoSelector newSearchNavi={newSearchNavi}></VideoSelector>
        </div>
    );
};

export default OrderShowtimeGroup;

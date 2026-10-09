import React, { useRef } from "react";

import { SearchOne } from "@/api/type";
import { IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
import InfoRow from "@/pages/bigpic/components/inforow";
import { date2ChineseString } from "@/util/time";

type ImageDetailPopupProps = {
    show: boolean;
    onClose: () => void;

    curImgInfo: SearchOne;
};

export const SearchPopup: React.FC<ImageDetailPopupProps> = ({
    show,
    onClose,

    curImgInfo,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
        <Popup show={show} ref={popupRef}>
            <div className="w-[85vw] h-[95vh] bg-white rounded-sm overflow-hidden grid grid-rows-[64px_1fr]">
                {/* 顶部标题栏 */}
                <div className="h-16 border-b border-solid border-gray-1 px-8 flex items-center justify-between">
                    <div
                        id="bigPicHead"
                        className="text-blue-2 flex items-center"
                    >
                        <span className="w-52">详细图片信息</span>
                    </div>
                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer"
                        onClick={onClose}
                    />
                </div>

                {/* 内容区域 */}
                <div
                    id="bigPicContainer"
                    className="overflow-hidden p-4 flex flex-col h-full gap-4"
                >
                    {/* 图片显示区域 */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <img
                            src={`/api/video/online/event/screenshot?image_path=${curImgInfo.url}`}
                            className="w-full h-full object-contain bg-[#d1d5dc] rounded-md"
                        />
                    </div>

                    {/* 底部信息栏 */}
                    <div className="w-full bg-white shadow-md rounded-lg border border-[#e5e7eb] px-6 py-4 flex flex-col gap-3">
                        {/* 第一行：事件基本信息 + 按钮 */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-12">
                                <InfoRow
                                    label="事件时间："
                                    value={date2ChineseString(curImgInfo.time)}
                                    width="w-20"
                                />
                                <InfoRow
                                    label="事件地点："
                                    value={curImgInfo.location}
                                    width="w-20"
                                />
                                <InfoRow
                                    label="命中关键词："
                                    value={curImgInfo.hitString || "无"}
                                    popupContainer={popupRef.current}
                                    width="w-22"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

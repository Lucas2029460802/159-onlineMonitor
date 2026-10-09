import React, { useRef } from "react";

import { AlertOne, Deal_Status } from "@/api/type";
import { IconClose, IconConfirm, IconIgnore } from "@/assets/svg";
import { Popup } from "@/components/popup";
import InfoRow from "@/pages/bigpic/components/inforow";
import { strategyMap, svStrategyId } from "@/pages/online/types";
import { date2ChineseString } from "@/util/time";

type ImageDetailPopupProps = {
    show: boolean;
    onClose: () => void;
    handleConfirm: (alertId: number) => void;
    handleIgnore: (alertId: number) => void;
    curImgInfo: AlertOne;
};

const AlertPopup: React.FC<ImageDetailPopupProps> = ({
    show,
    onClose,
    handleConfirm,
    handleIgnore,
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
                            src={`/api/video/online/alarm/screenshot?image_path=${curImgInfo.url}`}
                            className="w-full h-full object-contain bg-[#d1d5dc] rounded-md"
                        />
                    </div>

                    {/* 底部信息栏 */}
                    <div className="w-full bg-white shadow-md rounded-lg border border-[#e5e7eb] px-6 py-4 flex flex-col gap-3">
                        {/* 第一行：事件基本信息 + 按钮 */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-12">
                                <InfoRow
                                    label="事件类型："
                                    value={
                                        strategyMap[
                                            curImgInfo.strategy_id as svStrategyId
                                        ] ?? "未知名字的策略"
                                    }
                                />
                                <InfoRow
                                    label="事件时间："
                                    value={date2ChineseString(curImgInfo.time)}
                                />
                                <InfoRow
                                    label="事件地点："
                                    value={curImgInfo.location}
                                />
                            </div>
                            {curImgInfo.status === Deal_Status.not && (
                                <div className="flex gap-4">
                                    <button
                                        className="w-[130px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                        onClick={() =>
                                            handleConfirm(curImgInfo.id)
                                        }
                                    >
                                        <IconConfirm className="text-lg h-[20px]" />
                                        <div>确认已处理</div>
                                    </button>
                                    <button
                                        className="w-[135px] h-[34px] rounded-lg bg-gray-2 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                        onClick={() =>
                                            handleIgnore(curImgInfo.id)
                                        }
                                    >
                                        <IconIgnore className="text-lg h-[28px] relative -top-0.5" />
                                        <div>忽略此预警</div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 第二行：事件描述 */}
                        <div className="text-gray-700 text-sm flex items-start gap-2">
                            <InfoRow
                                label="事件描述："
                                value={curImgInfo.caption || "暂无描述"}
                                popupContainer={popupRef.current}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default AlertPopup;

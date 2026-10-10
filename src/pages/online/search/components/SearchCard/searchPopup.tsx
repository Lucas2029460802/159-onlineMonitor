import React, { useEffect, useMemo, useRef, useState } from "react";

import { onlineEventMediaUrl } from "../../util/media";

import { SearchMediaGenre, SearchOne } from "@/api/type";
import { IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
import InfoRow from "@/pages/bigpic/components/inforow";
import { date2ChineseString } from "@/util/time";

type ImageDetailPopupProps = {
    show: boolean;
    onClose: () => void;
    curImgInfo: SearchOne;
    /** 打开弹窗时优先展示的媒体路径（静态模式可能是 instance） */
    initialImagePath?: string;
    genre: SearchMediaGenre;
};

export const SearchPopup: React.FC<ImageDetailPopupProps> = ({
    show,
    onClose,
    curImgInfo,
    initialImagePath,
    genre,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const instances = useMemo(
        () => curImgInfo.instances?.filter(Boolean) ?? [],
        [curImgInfo.instances],
    );

    const mediaOptions = useMemo(() => {
        const opts: { label: string; path: string }[] = [];
        if (curImgInfo.url) {
            opts.push({ label: "动图", path: curImgInfo.url });
        }
        instances.forEach((path, i) => {
            opts.push({ label: `静图 ${i + 1}`, path });
        });
        return opts;
    }, [curImgInfo.url, instances]);

    const [activePath, setActivePath] = useState(
        initialImagePath || curImgInfo.url,
    );

    useEffect(() => {
        if (!show) return;
        const preferred =
            initialImagePath ||
            (genre === "gif" ? curImgInfo.url : instances[0] || curImgInfo.url);
        setActivePath(preferred);
    }, [show, initialImagePath, genre, curImgInfo.url, instances]);

    const tagText =
        curImgInfo.tag && curImgInfo.tag.length > 0
            ? curImgInfo.tag.join("、")
            : "无";
    const frameText =
        curImgInfo.start !== undefined && curImgInfo.end !== undefined
            ? `${curImgInfo.start} - ${curImgInfo.end}`
            : "无";

    return (
        <Popup show={show} ref={popupRef}>
            <div className="w-[85vw] h-[95vh] bg-white rounded-sm overflow-hidden grid grid-rows-[64px_1fr]">
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

                <div
                    id="bigPicContainer"
                    className="overflow-hidden p-4 flex flex-col h-full gap-4"
                >
                    <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <img
                                src={onlineEventMediaUrl(activePath)}
                                className="w-full h-full object-contain bg-[#d1d5dc] rounded-md"
                                alt=""
                            />
                        </div>
                        {mediaOptions.length > 1 && (
                            <div className="w-36 shrink-0 overflow-y-auto flex flex-col gap-2">
                                {mediaOptions.map((opt) => (
                                    <button
                                        key={opt.path + opt.label}
                                        type="button"
                                        onClick={() => setActivePath(opt.path)}
                                        className={`rounded-md overflow-hidden border-2 transition-colors ${
                                            activePath === opt.path
                                                ? "border-[#00AEEC]"
                                                : "border-transparent hover:border-gray-300"
                                        }`}
                                    >
                                        <img
                                            src={onlineEventMediaUrl(opt.path)}
                                            className="w-full aspect-video object-cover bg-[#d1d5dc]"
                                            alt={opt.label}
                                        />
                                        <div className="text-[11px] text-center py-1 text-[#61666d]">
                                            {opt.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full bg-white shadow-md rounded-lg border border-[#e5e7eb] px-6 py-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-x-12 gap-y-3">
                                <InfoRow
                                    label="事件时间："
                                    value={date2ChineseString(curImgInfo.time)}
                                    width="w-20"
                                />
                                <InfoRow
                                    label="事件地点："
                                    value={curImgInfo.location || "无"}
                                    width="w-20"
                                />
                                <InfoRow
                                    label="命中关键词："
                                    value={curImgInfo.hitString || "无"}
                                    popupContainer={popupRef.current}
                                    width="w-22"
                                />
                                <InfoRow
                                    label="类别标签："
                                    value={tagText}
                                    width="w-20"
                                />
                                <InfoRow
                                    label="帧范围："
                                    value={frameText}
                                    width="w-20"
                                />
                            </div>
                        </div>
                        {curImgInfo.caption ? (
                            <InfoRow
                                label="事件描述："
                                value={curImgInfo.caption}
                                popupContainer={popupRef.current}
                                width="w-20"
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </Popup>
    );
};

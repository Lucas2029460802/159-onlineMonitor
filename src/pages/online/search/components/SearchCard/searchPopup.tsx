import React, { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { onlineEventMediaUrl } from "../../util/media";

import { SearchMediaGenre, SearchOne } from "@/api/type";
import { IconClose, IconDownload } from "@/assets/svg";
import { Popup } from "@/components/popup";
import InfoRow from "@/pages/bigpic/components/inforow";
import { date2ChineseString } from "@/util/time";
import { Message } from "@/util/ui";

type ImageDetailPopupProps = {
    show: boolean;
    onClose: () => void;
    curImgInfo: SearchOne;
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
            (genre === "gif" ? curImgInfo.url : instances[0] || "");
        setActivePath(preferred);
    }, [show, initialImagePath, genre, curImgInfo.url, instances]);

    const tagText =
        curImgInfo.tag && curImgInfo.tag.length > 0
            ? curImgInfo.tag.join("、")
            : "无";

    const saveImage = async () => {
        try {
            const res = await fetch(onlineEventMediaUrl(activePath));
            if (!res.ok) throw new Error("download failed");
            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download =
                activePath.split("/").pop() ||
                (genre === "gif" ? "event.webp" : "event.jpg");
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            Message.warning("请稍后重试", "图片保存失败");
        }
    };

    return (
        <Popup show={show}>
            <div
                ref={popupRef}
                className="w-[85vw] h-[95vh] bg-white rounded-sm overflow-hidden grid grid-rows-[64px_1fr]"
            >
                <div className="h-16 border-b border-solid border-gray-1 px-8 flex items-center justify-between">
                    <div className="text-blue-2 flex items-center">
                        <span className="w-52">详细图片信息</span>
                    </div>
                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer"
                        onClick={onClose}
                    />
                </div>

                <div className="overflow-hidden p-4 flex flex-col h-full gap-4">
                    <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <img
                                src={onlineEventMediaUrl(activePath)}
                                className="w-full h-full object-contain bg-[#d1d5dc] rounded-md"
                                alt=""
                            />
                        </div>
                        {mediaOptions.length > 1 && (
                            <div className="w-28 shrink-0 overflow-y-auto flex flex-col gap-2">
                                {mediaOptions.map((opt) => (
                                    <button
                                        key={opt.path + opt.label}
                                        type="button"
                                        onClick={() => setActivePath(opt.path)}
                                        className={twMerge(
                                            "rounded-md overflow-hidden border-2 transition-colors",
                                            activePath === opt.path
                                                ? "border-[#00AEEC]"
                                                : "border-transparent hover:border-gray-300",
                                        )}
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

                    <div className="w-full shrink-0 bg-white shadow-md rounded-lg border border-[#e5e7eb] px-6 py-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex gap-10 flex-wrap min-w-0">
                                <InfoRow
                                    label="事件时间："
                                    value={date2ChineseString(curImgInfo.time)}
                                    width="w-20"
                                />
                                <InfoRow
                                    label="事件地点："
                                    value={curImgInfo.location || "无"}
                                    width="w-20"
                                    popupContainer={popupRef.current}
                                />
                                <InfoRow
                                    label="类别标签："
                                    value={tagText}
                                    width="w-20"
                                />
                                {curImgInfo.hitString ? (
                                    <InfoRow
                                        label="命中关键词："
                                        value={curImgInfo.hitString}
                                        width="w-22"
                                        popupContainer={popupRef.current}
                                    />
                                ) : null}
                            </div>
                            <button
                                className="w-[90px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer shrink-0"
                                onClick={saveImage}
                            >
                                <IconDownload className="text-lg" />
                                <div>保存</div>
                            </button>
                        </div>
                        {curImgInfo.caption ? (
                            <InfoRow
                                label="事件描述："
                                value={curImgInfo.caption}
                                width="w-20"
                                popupContainer={popupRef.current}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </Popup>
    );
};

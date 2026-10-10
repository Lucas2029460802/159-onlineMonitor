import React, { useEffect, useMemo, useRef, useState } from "react";

import { onlineEventMediaUrl } from "../../util/media";

import { SearchMediaGenre, SearchOne } from "@/api/type";
import { IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
import { date2ChineseString } from "@/util/time";

type ImageDetailPopupProps = {
    show: boolean;
    onClose: () => void;
    curImgInfo: SearchOne;
    /** 打开弹窗时优先展示的媒体路径（静态模式可能是 instance） */
    initialImagePath?: string;
    genre: SearchMediaGenre;
};

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <div className="text-[11px] text-[#9499a0] mb-0.5">{label}</div>
            <div className="text-[13px] text-[#18191c] break-all leading-5">
                {value || "无"}
            </div>
        </div>
    );
}

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
            <div className="w-[min(1100px,92vw)] h-[min(860px,90vh)] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                <div className="h-14 shrink-0 border-b border-[#eef1f4] px-5 flex items-center justify-between">
                    <div className="text-[15px] font-medium text-[#00aeec]">
                        事件详情
                    </div>
                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer hover:text-[#18191c]"
                        onClick={onClose}
                    />
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
                    {/* 主图区 */}
                    <div className="min-h-0 bg-[#111827] flex items-center justify-center p-3">
                        <img
                            src={onlineEventMediaUrl(activePath)}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            alt=""
                        />
                    </div>

                    {/* 右侧信息区 */}
                    <aside className="min-h-0 border-l border-[#eef1f4] flex flex-col bg-[#fafbfc]">
                        {mediaOptions.length > 1 && (
                            <div className="px-4 pt-4 pb-2 shrink-0">
                                <div className="text-[12px] text-[#9499a0] mb-2">
                                    关联媒体
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {mediaOptions.map((opt) => (
                                        <button
                                            key={opt.path + opt.label}
                                            type="button"
                                            onClick={() =>
                                                setActivePath(opt.path)
                                            }
                                            className={`shrink-0 w-20 rounded-lg overflow-hidden border-2 transition-colors bg-white ${
                                                activePath === opt.path
                                                    ? "border-[#00AEEC]"
                                                    : "border-transparent hover:border-[#d1d5dc]"
                                            }`}
                                        >
                                            <img
                                                src={onlineEventMediaUrl(
                                                    opt.path,
                                                )}
                                                className="w-full aspect-video object-cover bg-[#e5e7eb]"
                                                alt={opt.label}
                                            />
                                            <div className="text-[10px] text-center py-0.5 text-[#61666d]">
                                                {opt.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <MetaItem
                                    label="事件时间"
                                    value={date2ChineseString(curImgInfo.time)}
                                />
                                <MetaItem
                                    label="事件地点"
                                    value={curImgInfo.location || "无"}
                                />
                                <MetaItem label="类别标签" value={tagText} />
                                <MetaItem label="帧范围" value={frameText} />
                                {curImgInfo.hitString ? (
                                    <MetaItem
                                        label="命中关键词"
                                        value={curImgInfo.hitString}
                                    />
                                ) : null}
                            </div>

                            <div className="rounded-xl border border-[#e8ecf0] bg-white p-3">
                                <div className="text-[12px] text-[#9499a0] mb-1.5">
                                    事件描述
                                </div>
                                <p className="text-[13px] text-[#18191c] leading-6 m-0 whitespace-pre-wrap break-words">
                                    {curImgInfo.caption?.trim() || "暂无描述"}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </Popup>
    );
};

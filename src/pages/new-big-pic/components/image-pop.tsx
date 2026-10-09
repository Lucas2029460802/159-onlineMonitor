import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { ImageInfo, SearchTarget } from "../new-big-pic";
import ThreePic from "./pop-three-pic";
import { downloadImage } from "./util";

import { api } from "@/api";
import { AdditionImgInfo } from "@/api/type";
import { IconClose, IconDownload, IconJump, IconSearch } from "@/assets/svg";
import { Popup } from "@/components/popup";
import { urlCurEvtType, urlPicGenre } from "@/pages/bigpic";
import InfoRow from "@/pages/bigpic/components/inforow";
import { calcTime } from "@/pages/video-player/util";
import { $Search } from "@/store/search";
import { date2ChineseString } from "@/util/time";
import { Message } from "@/util/ui";

type ImageDetailPopupProps = {
    show: boolean;
    onClose: () => void;
    curImgInfo: ImageInfo;
    taskId: string | undefined;
    newSearchNavi: (newTarget: Partial<SearchTarget>) => void;
    genre: urlPicGenre;
    type: urlCurEvtType;
};

const ImageDetailPopup: React.FC<ImageDetailPopupProps> = ({
    show,
    onClose,
    curImgInfo,
    taskId,
    newSearchNavi,
    genre,
    type,
}) => {
    console.log(curImgInfo);
    const jumpToPlayer = () => {
        const relSec = Math.floor(curImgInfo.relTime);
        const paths = location.pathname.split("/");
        window.open(
            `/${paths[1]}/${taskId}/player?id=${curImgInfo.vid}&time=${relSec}`,
        );
    };
    const searchCurPic = async () => {
        try {
            const res = await fetch(
                `/api/video/screenshot?image_path=${curImgInfo.imgSrc}`,
                { credentials: "include" },
            );
            if (!res.ok) throw new Error("图片获取失败");

            const blob = await res.blob();
            const file = new File(
                [blob],
                curImgInfo.imgSrc.split("/").pop() || "image.jpg",
                {
                    type: blob.type || "image/jpeg",
                },
            );

            $Search.update("set big pic as search target pic", (s) => {
                s.image = file;
            });
            newSearchNavi({
                keywords: "",
                sort_field_id: 1,
                sortOrder: 1,
            });
            onClose();
        } catch {
            Message.warning("请稍后重试", "图片获取失败");
        }
    };

    // 额外的信息
    const [data, setData] = useState<AdditionImgInfo>({
        originalSrc: "",
        bodySrc: "",
        faceSrc: "",
        bbox: { x: 0, y: 0, w: 1, h: 1 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const eId = curImgInfo.evtId;
            if (eId !== undefined && genre !== "gif") {
                setLoading(true);
                const res = await api.task.threePic(eId);
                setLoading(false);
                setData(res.Data);
            }
        };
        load();
    }, [curImgInfo.evtId, genre]);

    return (
        <Popup show={show}>
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
                    {genre === "gif" ||
                    type === "other" ||
                    curImgInfo.isOther ? (
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <img
                                src={`${window.origin}/api/video/screenshot?image_path=${curImgInfo.imgSrc}`}
                                className="w-full h-full object-contain bg-[#d1d5dc] rounded-md"
                            />
                        </div>
                    ) : (
                        <ThreePic data={data} loading={loading}></ThreePic>
                    )}

                    {/* 底部信息栏 */}
                    <div className="w-full h-[68px] bg-white shadow-md rounded-lg border border-[#e5e7eb] px-6 py-4 flex items-center justify-between">
                        <div className="flex gap-12">
                            <InfoRow
                                label="事件真实时间："
                                value={date2ChineseString(curImgInfo.absTime)}
                            />
                            <InfoRow
                                label="事件相对时间："
                                value={calcTime(curImgInfo.relTime)}
                            />
                            <InfoRow
                                label="所属视频 ID："
                                value={curImgInfo.vid}
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                className={twMerge(
                                    "w-[130px] h-[34px] rounded-lg  flex items-center justify-center text-white gap-1.5 hover:opacity-90 ",
                                    genre !== "gif"
                                        ? "bg-blue-1 cursor-pointer"
                                        : "bg-[#e7e7e7] cursor-not-allowed",
                                )}
                                onClick={searchCurPic}
                                disabled={genre === "gif"}
                            >
                                <IconSearch className="text-lg" />
                                <div>搜索相似图</div>
                            </button>
                            <button
                                className="w-[90px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                onClick={() => {
                                    downloadImage(curImgInfo);
                                }}
                            >
                                <IconDownload className="text-lg" />
                                <div>保存</div>
                            </button>
                            <button
                                className="w-[90px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                onClick={jumpToPlayer}
                            >
                                <IconJump className="text-lg" />
                                <div>跳转</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default ImageDetailPopup;

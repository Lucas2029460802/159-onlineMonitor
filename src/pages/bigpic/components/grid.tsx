import { Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { urlCurEvtType, urlPicGenre } from "..";
import InfoRow from "./inforow";
import { Selector } from "./selector";
import { SelectorOption } from "./selector-option";
import { RangeTimePicker } from "./time-picker";

import { api } from "@/api";
import { BigPicPagePerRes, type2BackendTagID } from "@/api/type";
import { IconClose, IconDownload, IconEmpty, IconJump } from "@/assets/svg";
import Loading from "@/components/header/components/loading/loading";
import LazyImage from "@/components/image";
import { Pagination } from "@/components/pagination";
import { Popup } from "@/components/popup";
import { EventsImage } from "@/pages/video-player/components/events-list/events-list";
import { calcTime } from "@/pages/video-player/util";
import { date2ChineseString } from "@/util/time";

const PerPage = 6 * 10;
interface ImageInfo {
    imgSrc: string;
    relTime: number;
    absTime: Date;
    vid: number;
}
interface BigPicGridProps {
    showTime: boolean;
    curPage: number;
    curEvtType: urlCurEvtType;
    sortOrder: number;
    setSortOrder: React.Dispatch<React.SetStateAction<number>>;
    genre: urlPicGenre;
}
export const Evt2StringMap = new Map<urlCurEvtType, string>([
    ["all", "全部"],
    ["person", "人"],
    ["car", "车"],
    ["bike", "非机动车"],
    ["other", "其它"],
]);

export type TimeRange = [Dayjs, Dayjs] | [undefined, undefined];

function evt2String(urlEvtType: urlCurEvtType) {
    return Evt2StringMap.get(urlEvtType) ?? "全部";
}

export default function BigPicGrid({
    showTime,
    curPage,
    curEvtType,
    sortOrder,
    genre,
}: BigPicGridProps) {
    const [allEvents, setAllEvents] = useState<BigPicPagePerRes[]>([]);
    const [loading, setLoading] = useState(true);
    const { taskId } = useParams();
    const bigPicContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [total, setTotal] = useState<number>(1);
    const [showPop, setShowPop] = useState<boolean>(true);
    const [curImgInfo, setCurImgInfo] = useState<ImageInfo>({
        imgSrc: "",
        relTime: 0,
        absTime: new Date(),
        vid: -1,
    });
    const [timeRange, setTimeRange] = useState<TimeRange>([
        undefined,
        undefined,
    ]);
    useEffect(() => {
        const fetchData = async () => {
            if (taskId === undefined) return;
            setLoading(true);
            const [totalRes, pageRes] = await Promise.all([
                api.task.bigpicTotal(
                    Number(taskId),
                    genre,
                    type2BackendTagID.get(curEvtType),
                    timeRange[0],
                    timeRange[1],
                ),
                // 这里需要着重修改 TODO
                api.task.bigpicPage(
                    Number(taskId),
                    genre,
                    type2BackendTagID.get(curEvtType),
                    curPage - 1,
                    PerPage,
                    sortOrder,
                    timeRange[0],
                    timeRange[1],
                ),
            ]);
            setTotal(totalRes.Data);
            setAllEvents(pageRes.Data ? pageRes.Data : []);
            setLoading(false);
        };
        fetchData();
    }, [curEvtType, curPage, genre, sortOrder, taskId, timeRange]);

    const eventsFiltered = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const a: EventsImage[][] = allEvents.map((video) => {
            if (genre === "gif") {
                // 展示GIFd
                if (video.GifEvents === null) return [];
                return video.GifEvents.map((item) => {
                    const plus8Time = new Date(item.Time);
                    plus8Time.setHours(plus8Time.getHours() - 8);
                    return {
                        src: item.Gif,
                        startRelTime: Math.floor(item.Start / video.FrameRate),
                        absTime: plus8Time,
                        vid: video.videoId,
                    };
                });
            } else {
                // 不展示GIF，那么就根据事件类型划分
                const evts =
                    video.Events !== null
                        ? video.Events.sort((a, b) => {
                              const at = new Date(a.Time);
                              const bt = new Date(b.Time);
                              // 根据order排序
                              if (sortOrder === 0) {
                                  return at.getTime() - bt.getTime();
                              } else {
                                  return bt.getTime() - at.getTime();
                              }
                          })
                        : [];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const dealtEvts: EventsImage[] = evts.map((item) => {
                    const plus8Time = new Date(item.Time);
                    plus8Time.setHours(plus8Time.getHours() - 8);
                    return {
                        src: item.ScreenShot,
                        startRelTime: item.ScreenShotIndex
                            ? Math.floor(item.ScreenShotIndex / video.FrameRate)
                            : Math.floor(item.Start / video.FrameRate),
                        absTime: plus8Time,
                        vid: video.videoId,
                    };
                });

                return dealtEvts;
            }
        });
        return a.flat();
    }, [allEvents, genre, sortOrder]);

    return (
        <div className="w-[85vw] max-h-[100vh] bg-white rounded-sm  pb-5 overflow-hidden flex-1">
            <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between mb-1">
                <div id="bigPicHead" className="text-blue-2 flex items-center ">
                    <span className="w-62">
                        {`${genre === "gif" ? "动态图" : "静态图"} · <${evt2String(curEvtType)}>事件展示`}
                        {`${loading ? "" : total === 0 ? "(空)" : "(" + total + ")"}`}
                    </span>
                    <Selector
                        defaultLabel={evt2String(curEvtType)}
                        disabled={loading}
                        containerClassName="min-w-32"
                        contentDescriptor="类型："
                    >
                        {[...Evt2StringMap.entries()].map((item) => (
                            <SelectorOption
                                labelTobeSelect={item[1]}
                                labelToShow={item[1]}
                                key={item[1]}
                                onClick={() =>
                                    navigate(
                                        `${location.pathname}?page=1&genre=${genre}&type=${item[0]}&order=0`,
                                    )
                                }
                                className="text-center"
                            >
                                {item[1]}
                            </SelectorOption>
                        ))}
                    </Selector>
                    <Selector
                        defaultLabel={sortOrder === 0 ? "升序" : "降序"}
                        disabled={loading}
                        containerClassName="min-w-32"
                        contentDescriptor="排序："
                    >
                        <SelectorOption
                            labelTobeSelect="按真实时间升序"
                            labelToShow="升序"
                            onClick={() =>
                                navigate(
                                    `${location.pathname}?page=1&genre=${genre}&type=${curEvtType}&order=0`,
                                )
                            }
                        ></SelectorOption>
                        <SelectorOption
                            labelTobeSelect="按真实时间降序"
                            labelToShow="降序"
                            onClick={() =>
                                navigate(
                                    `${location.pathname}?page=1&genre=${genre}&type=${curEvtType}&order=1`,
                                )
                            }
                        ></SelectorOption>
                    </Selector>
                    <div className="ml-6 px-[15px] h-8  text-sm rounded-lg  cursor-pointer select-none leading-8">
                        <RangeTimePicker
                            setTimeRange={setTimeRange}
                        ></RangeTimePicker>
                    </div>
                </div>
            </div>
            {loading ? (
                <div className="px-0 pt-1 overflow-y-auto h-[calc(100vh-64px-64px)] relative">
                    <Loading transparent></Loading>
                </div>
            ) : eventsFiltered.length === 0 ? (
                <div className="h-[calc(100vh-64px-64px)] flex justify-center items-center">
                    <div className="w-56 h-56">
                        <IconEmpty />
                        <div className="text-gray-400 text-xl mt-4 text-center">
                            事件数量为空！
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    id="bigPicContainer"
                    ref={bigPicContainerRef}
                    className="grid grid-cols-6 gap-0.5 px-4 pt-1 overflow-y-auto max-h-[calc(100vh-64px-64px-66px)]"
                >
                    {eventsFiltered.map((item, index) => {
                        return (
                            <LazyImage
                                key={`${curEvtType}-player-image-${(curPage - 1) * PerPage + index}`}
                                onClick={() => {
                                    setCurImgInfo({
                                        imgSrc: item.src,
                                        absTime: item.absTime,
                                        relTime: item.startRelTime,
                                        vid: item.vid!, // TODO:不敢不相信啊
                                    });
                                    setShowPop(true);
                                }}
                                src={`api/video/screenshot?image_path=${item.src}`}
                                className="aspect-video bg-[#d1d5dc] flex items-center justify-center  cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform  "
                            >
                                {item.absTime !== undefined && showTime && (
                                    <div
                                        className={twMerge(
                                            "absolute left-0 top-0 z-[0] w-full h-6 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] pl-1  pb-1.5",
                                            "opacity-100 transition-opacity",
                                        )}
                                    >
                                        <div className=" text-white   text-[14px] leading-6">
                                            {date2ChineseString(item.absTime)}
                                        </div>
                                    </div>
                                )}
                                {showTime && (
                                    <div className="absolute bottom-1.5 right-1.5 bg-black/40 h-5 leading-5 text-white px-1 text-[13px] rounded-xs ">
                                        {calcTime(item.startRelTime)}
                                    </div>
                                )}
                            </LazyImage>
                        );
                    })}
                </div>
            )}
            {eventsFiltered.length === 0 ? (
                <></>
            ) : (
                <div className="flex justify-center my-4">
                    <Pagination
                        defaultValue={curPage}
                        curPage={curPage}
                        total={Math.ceil(total / PerPage)}
                        onChange={(current) => {
                            if (bigPicContainerRef.current !== null) {
                                bigPicContainerRef.current.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                });
                            }
                            navigate(
                                `${location.pathname}?page=${current}&genre=${genre}&type=${curEvtType}&order=${sortOrder}`,
                            );
                        }}
                    ></Pagination>
                </div>
            )}

            {curImgInfo.imgSrc !== "" && (
                <Popup show={showPop}>
                    <div className="w-[85vw] h-[95vh] bg-white rounded-sm  overflow-hidden grid grid-rows-[64px_1fr]">
                        <div className="border-b border-solid border-gray-1 px-8 flex items-center justify-between">
                            <div
                                id="bigPicHead"
                                className="text-blue-2 flex items-center"
                            >
                                <span className="w-52">详细图片信息</span>
                            </div>
                            <IconClose
                                className="text-lg text-gray-2 cursor-pointer"
                                onClick={() => setShowPop(false)}
                            />
                        </div>
                        <div
                            id="bigPicContainer"
                            className="overflow-hidden p-4 flex flex-col h-full gap-4"
                        >
                            {/* 图片部分：占用剩余空间，居中显示 */}
                            <div className="flex-1 flex items-center justify-center">
                                <img
                                    src={`${window.origin}/api/video/screenshot?image_path=${curImgInfo.imgSrc}`}
                                    className="aspect-video bg-[#d1d5dc]  h-full  object-contain rounded-md"
                                />
                            </div>

                            {/* 信息栏：固定高度、贴底显示 */}
                            <div className="w-full bg-white shadow-md rounded-lg border border-[#e5e7eb] px-6 py-4 flex items-center justify-between">
                                {/* 信息区域：横排 */}
                                <div className="flex gap-12">
                                    <InfoRow
                                        label="事件真实时间："
                                        value={date2ChineseString(
                                            curImgInfo.absTime,
                                        )}
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

                                {/* 按钮区域 */}
                                <div className="flex gap-4">
                                    <button
                                        className="w-[90px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(
                                                    `${window.origin}/api/video/screenshot?image_path=${curImgInfo.imgSrc}`,
                                                    { credentials: "include" },
                                                );
                                                if (!res.ok)
                                                    throw new Error("下载失败");

                                                const blob = await res.blob();
                                                const url =
                                                    URL.createObjectURL(blob);
                                                const link =
                                                    document.createElement("a");
                                                link.href = url;
                                                link.download =
                                                    curImgInfo.imgSrc
                                                        .split("/")
                                                        .pop() ||
                                                    "screenshot.jpg";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                URL.revokeObjectURL(url);
                                            } catch {
                                                alert("下载失败，请稍后重试");
                                            }
                                        }}
                                    >
                                        <IconDownload className="text-lg" />
                                        <div>保存</div>
                                    </button>
                                    <button
                                        className="w-[90px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                        onClick={() => {
                                            const paths =
                                                location.pathname.split("/");
                                            window.open(
                                                `/${paths[1]}/${taskId}/player?id=${curImgInfo.vid}&time=${Math.floor(curImgInfo.relTime)}`,
                                            );
                                        }}
                                    >
                                        <IconJump className="text-lg" />
                                        <div>跳转</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </div>
    );
}

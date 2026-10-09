import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import Loading from "./loading/loading";

import { api } from "@/api";
import { CertainEvtInfo, TaskEvent } from "@/api/type";
import { IconClose } from "@/assets/svg";
import LazyImage from "@/components/image";
import { Pagination } from "@/components/pagination";
import { Popup } from "@/components/popup";
import {
    EvtType,
    evtTypeMap,
} from "@/pages/video-player/components/events-type";
import { calcTime } from "@/pages/video-player/util";
import { date2ChineseString } from "@/util/time";
interface BigPicProps {
    showBigPic: boolean;
    setShowBigPic: React.Dispatch<React.SetStateAction<boolean>>;
}
interface EventsImage {
    src: string;
    startRelTime: number;
    absTime: Date;
    vid: number;
}
// const PerPage = 6 * 7 * 3;
const PerPage = 6 * 6;
export default function BigPic({ showBigPic, setShowBigPic }: BigPicProps) {
    const [curEvtType, setCurEvtType] = useState(EvtType.All);
    const [allEvents, setAllEvents] = useState<TaskEvent[]>([]);
    const [showTime, setShowTime] = useState(true);
    const [loading, setLoading] = useState(true);
    const { taskId } = useParams();
    const bigPicContainerRef = useRef<HTMLDivElement>(null);
    const [showGif, setShowGIF] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            if (taskId === undefined) return;
            setLoading(true);
            const res = await api.task.events(Number(taskId));
            setAllEvents(res.Data);
            setLoading(false);
        };
        fetchData();
    }, [taskId]);

    const eventsFiltered = useMemo(() => {
        const a: EventsImage[][] = allEvents.map((video) => {
            if (showGif === false) {
                // 不展示GIF，那么就根据事件类型划分
                let raw: CertainEvtInfo[];
                if (curEvtType === EvtType.Car) {
                    raw = video.CarEventList;
                } else if (curEvtType === EvtType.Other) {
                    raw = video.OtherEventList;
                } else if (curEvtType === EvtType.Person) {
                    raw = video.PersonEventList;
                } else {
                    raw = [
                        ...video.CarEventList,
                        ...video.OtherEventList,
                        ...video.PersonEventList,
                    ].sort((a, b) => a.start - b.start);
                }
                const evts: EventsImage[] = raw.map((item) => ({
                    src: item.ScreenShot,
                    startRelTime: item.ScreenShotIndex
                        ? Math.floor(item.ScreenShotIndex / video.FrameRate)
                        : Math.floor(item.start / video.FrameRate),
                    absTime: new Date(item.Time),
                    vid: video.VideoId,
                }));
                return evts;
            } else {
                // 展示GIF
                if (video.Gif_events === null) return [];
                return video.Gif_events.map((item) => ({
                    src: item.Gif,
                    startRelTime: Math.floor(item.start / video.FrameRate),
                    absTime: new Date(item.Time),
                    vid: video.VideoId,
                }));
            }
        });
        return a.flat();
    }, [allEvents, curEvtType, showGif]);
    const [curPage, setCurPage] = useState(1);
    const [paginationKey, setPaginationKey] = useState(0);
    return (
        <Popup show={showBigPic}>
            <div className="w-[85vw] max-h-[100vh] bg-white rounded-sm  pb-5 overflow-hidden ">
                <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between mb-1">
                    <div
                        id="bigPicHead"
                        className="text-blue-2 flex items-center "
                    >
                        <span className="w-52">
                            {showGif
                                ? `GIF大图展示`
                                : `<${evtTypeMap.get(curEvtType)?.d}>事件大图展示`}
                            {`${loading ? "" : eventsFiltered.length === 0 ? "(空)" : "(" + eventsFiltered.length + ")"}`}
                        </span>
                        <div
                            className="ml-10 px-2 h-8 leading-8 text-sm rounded-lg bg-gray-1 cursor-pointer hover:bg-gray-3 select-none text-black"
                            style={{
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                            onClick={(e) => {
                                if (loading) return;
                                e.stopPropagation();
                                setShowGIF(!showGif);
                                setCurPage(1);
                                setPaginationKey(Date.now());
                            }}
                        >
                            {showGif ? "展示静态图" : "展示动态图"}
                        </div>
                        <div
                            className="ml-10 px-2 h-8 leading-8 text-sm rounded-lg bg-gray-1 cursor-pointer hover:bg-gray-3 select-none text-black"
                            style={{
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                            onClick={(e) => {
                                if (loading) return;
                                e.stopPropagation();
                                setShowTime((prev) => !prev);
                            }}
                        >
                            {showTime ? "时间隐藏" : "时间显示"}
                        </div>
                        {showGif ? (
                            <></>
                        ) : (
                            <div
                                className="ml-10 px-2 h-8 leading-8 text-sm rounded-lg bg-gray-1 cursor-pointer hover:bg-gray-3 select-none text-black"
                                style={{
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (loading) return;
                                    const maxEvtTypeValue =
                                        Math.max(
                                            ...(Object.values(EvtType).filter(
                                                (v) => typeof v === "number",
                                            ) as number[]),
                                        ) + 1;
                                    setCurEvtType(
                                        (curEvtType + 1) % maxEvtTypeValue,
                                    );
                                    setCurPage(1);
                                    setPaginationKey(Date.now());
                                }}
                            >
                                事件类型切换
                            </div>
                        )}
                    </div>

                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer"
                        onClick={() => {
                            setShowBigPic(false);
                        }}
                    />
                </div>
                {loading ? (
                    <div className="px-0 pt-1 overflow-y-auto h-[calc(100vh-64px-64px)] relative">
                        <Loading transparent></Loading>
                    </div>
                ) : (
                    <div
                        id="bigPicContainer"
                        ref={bigPicContainerRef}
                        className="grid gap-0.5 px-4 pt-1 overflow-y-auto max-h-[calc(100vh-64px-64px)]"
                        style={{
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                        }}
                    >
                        {eventsFiltered
                            .slice((curPage - 1) * PerPage, curPage * PerPage)
                            .map((item, index) => {
                                const d = Date.now();
                                return (
                                    <LazyImage
                                        key={`player-image-${index}-${d}`}
                                        onClick={() => {
                                            const paths =
                                                location.pathname.split("/");
                                            window.open(
                                                `/${paths[1]}/${taskId}/player?id=${item.vid}&time=${Math.floor(item.startRelTime)}`,
                                            );
                                        }}
                                        src={`api/video/screenshot?image_path=${item.src}`}
                                        className="aspect-video bg-[#d1d5dc] flex items-center justify-center  cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform"
                                    >
                                        {item.absTime !== undefined &&
                                            showTime && (
                                                <div
                                                    className={twMerge(
                                                        "absolute left-0 top-0 z-[0] w-full h-6 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] pl-1  pb-1.5",
                                                        "opacity-100 transition-opacity",
                                                    )}
                                                >
                                                    <div className=" text-white   text-[14px] leading-6">
                                                        {date2ChineseString(
                                                            item.absTime,
                                                        )}
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
                <div className="flex justify-center my-4">
                    <Pagination
                        key={paginationKey}
                        total={Math.ceil(eventsFiltered.length / PerPage)}
                        onChange={(current) => {
                            setCurPage(current);
                            if (bigPicContainerRef.current !== null) {
                                bigPicContainerRef.current.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                });
                            }
                        }}
                    ></Pagination>
                </div>
            </div>
        </Popup>
    );
}

import { useState, useRef, useEffect, useMemo, memo } from "react";
import { twMerge } from "tailwind-merge";

import { calcTime, getCurEvtLists } from "../../util";
import { EvtType } from "../events-type";
import { ListHead } from "./list-head";

import { CertainEvtInfo } from "@/api/type";
import LazyImage from "@/components/image";
import { date2ChineseString } from "@/util/time";

export interface EventsImage {
    src: string;
    startRelTime: number;
    absTime: Date;
    vid?: number;
    textScore: number;
    caption?: string;
    hitString?: string;
    eId?: number; // 事件id
    isOther?: boolean;
}
export enum CurShowType {
    single = 1,
    double = 2,
    triple = 3,
}

interface EventsListProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    frameRate: number;
    curEvtType: EvtType;
    carEvents: CertainEvtInfo[];
    personEvents: CertainEvtInfo[];
    otherEvents: CertainEvtInfo[];
}

const EventsList = memo(
    ({
        videoRef,
        curEvtType,
        carEvents,
        personEvents,
        otherEvents,
        frameRate,
    }: EventsListProps) => {
        const [showTypeChoose, setShowTypeChoose] = useState(false);
        const [curShowType, setCurShowType] = useState(CurShowType.double);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const filteredEvents = useMemo(() => {
            return getCurEvtLists(
                personEvents ?? [],
                otherEvents ?? [],
                carEvents ?? [],
                curEvtType,
            );
        }, [carEvents, curEvtType, otherEvents, personEvents]);

        const eventsImageFiltered: EventsImage[] = useMemo(
            () =>
                filteredEvents.map((item) => {
                    const plus8Time = new Date(item.Time);
                    // plus8Time.setHours(plus8Time.getHours() - 8);
                    plus8Time.setHours(plus8Time.getHours());
                    return {
                        src: item.ScreenShot,
                        startRelTime: item.ScreenShotIndex
                            ? Math.floor(item.ScreenShotIndex / frameRate)
                            : Math.floor(item.Start / frameRate),
                        absTime: plus8Time,
                    };
                }),
            [filteredEvents, frameRate],
        );

        // 展示方式事件绑定
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node)
                ) {
                    setShowTypeChoose(false);
                }
            }

            if (showTypeChoose) {
                document.addEventListener("mousedown", handleClickOutside);
            } else {
                document.removeEventListener("mousedown", handleClickOutside);
            }

            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, [showTypeChoose]);

        // 动态设置右侧视频列表高度
        const listHeadRef = useRef<HTMLDivElement>(null);
        const [listHeight, setListHeight] = useState<number>(0);
        useEffect(() => {
            function updateHeight() {
                const videoHeight = videoRef.current?.offsetHeight || 0;
                const headHeight = listHeadRef.current?.offsetHeight || 0;
                const newHeight = videoHeight - headHeight - 16; // 16是m-top的像素
                setListHeight(newHeight > 0 ? newHeight : 0);
                console.log("newHeight:", newHeight, "headHeight:", headHeight);
            }

            // 初次设置
            updateHeight();

            // 监听窗口大小变化
            window.addEventListener("resize", updateHeight);
            return () => window.removeEventListener("resize", updateHeight);
        }, []);
        return (
            <div>
                <ListHead
                    curEvtType={curEvtType}
                    showTypeChoose={showTypeChoose}
                    setShowTypeChoose={setShowTypeChoose}
                    setCurShowType={setCurShowType}
                    eventsImageFiltered={eventsImageFiltered}
                    dropdownRef={dropdownRef}
                    videoRef={videoRef}
                    listHeadRef={listHeadRef}
                ></ListHead>
                <div
                    id="dml-events-list"
                    className={`overflow-y-scroll grid gap-4 mt-4  ${curShowType === CurShowType.single ? "grid-cols-1" : curShowType === CurShowType.double ? "grid-cols-2" : "grid-cols-3"}`}
                    style={{ maxHeight: listHeight }}
                >
                    {eventsImageFiltered.map((item, index) => {
                        return (
                            <LazyImage
                                key={`player-image-${index}`}
                                onClick={() => {
                                    if (videoRef.current === null) return;
                                    videoRef.current.currentTime =
                                        item.startRelTime;
                                }}
                                src={`api/video/screenshot?image_path=${item.src}`}
                                className=" aspect-video bg-[#d1d5dc] flex items-center justify-center rounded-lg cursor-pointer"
                            >
                                {item.absTime !== undefined && (
                                    <div
                                        className={twMerge(
                                            "absolute left-0 top-0 z-[0] w-full h-5 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] pl-1  pb-1.5",
                                            "opacity-100 transition-opacity",
                                        )}
                                    >
                                        <div
                                            className={twMerge(
                                                "flex items-center  text-white h-5 ",
                                                curShowType < CurShowType.triple
                                                    ? "text-[12px]"
                                                    : "text-[8px]",
                                            )}
                                        >
                                            {date2ChineseString(item.absTime)}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-1.5 right-1.5 bg-black/40 h-5 leading-5 text-white px-1 text-[13px] rounded-xs ">
                                    {calcTime(item.startRelTime)}
                                </div>
                            </LazyImage>
                        );
                    })}
                </div>
            </div>
        );
    },
);
EventsList.displayName = "EventsList";
export default EventsList;

import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { EvtType, evtTypeMap } from "../events-type";
import { CurShowType, EventsImage } from "./events-list";
import BigImageIcon from "../../assets/big-image.svg?react";
import DropdownIcon from "../../assets/trigger-dropdown.svg?react";
import { calcTime } from "../../util";

import { IconClose } from "@/assets/svg";
import LazyImage from "@/components/image";
import { Popup } from "@/components/popup";
import { date2ChineseString } from "@/util/time";

interface ListHeadProps {
    curEvtType: EvtType;
    showTypeChoose: boolean;
    setShowTypeChoose: React.Dispatch<React.SetStateAction<boolean>>;
    setCurShowType: React.Dispatch<React.SetStateAction<CurShowType>>;
    eventsImageFiltered: EventsImage[];
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    listHeadRef: React.RefObject<HTMLDivElement | null>;
}

export function ListHead({
    curEvtType,
    showTypeChoose,
    setShowTypeChoose,
    setCurShowType,
    eventsImageFiltered,
    dropdownRef,
    videoRef,
    listHeadRef,
}: ListHeadProps) {
    const showTypeButtonList = [
        { text: "单列展示", changeToType: CurShowType.single },
        { text: "双列展示", changeToType: CurShowType.double },
        { text: "三列展示", changeToType: CurShowType.triple },
    ];
    const [showTime, setShowTime] = useState(true);
    const [showPop, setShowPop] = useState(false);
    const [lastChoosed, setLastChoosed] = useState(-1);
    return (
        <div
            id="dml-events-head"
            className="h-11 bg-[rgb(241,242,243)] rounded-lg"
            ref={listHeadRef}
        >
            <div className="relative inline-flex w-full">
                <div className="pl-4 pr-2.5 text-[15px] h-11 leading-11 relative">
                    <span>
                        {`<${evtTypeMap.get(curEvtType)?.d}>`}事件列表
                        {eventsImageFiltered.length > 0
                            ? ` (${eventsImageFiltered.length})`
                            : ""}
                    </span>
                    <span
                        className="w-[14px] h-[14px] inline-block ml-[9px] align-middle cursor-pointer"
                        onClick={() => setShowTypeChoose(true)}
                    >
                        <DropdownIcon className="w-full h-full fill-[#757575]" />
                        {showTypeChoose && (
                            <div
                                ref={dropdownRef}
                                id="dml-events-showtype-dropdown"
                                className="bg-white  top-[30px] right-0 z-[2] rounded-lg shadow-md py-2 absolute"
                            >
                                {showTypeButtonList.map((button) => {
                                    return (
                                        <div
                                            className="text-sm h-9 leading-9 px-3 select-none cursor-pointer hover:bg-[rgb(244,244,245)] transition"
                                            onClick={() => {
                                                setCurShowType(
                                                    button.changeToType,
                                                );
                                                setShowTypeChoose(false);
                                            }}
                                            key={button.text}
                                        >
                                            {button.text}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </span>
                </div>

                <div
                    className=" ml-auto mr-4 mt-1.5 px-4 ptext-[15px] h-8 leading-8 cursor-pointer bg-blue-1 text-white rounded-lg  "
                    onClick={() => {
                        setShowPop(true);
                    }}
                >
                    <span className="flex items-center gap-1">
                        <BigImageIcon className="inline-block w-5 h-5 " />
                        大图
                    </span>
                </div>
            </div>
            {showPop && (
                <Popup show>
                    <div className="w-[85vw] max-h-[90vh] bg-white rounded-sm  pb-5 overflow-hidden ">
                        <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between mb-1">
                            <div
                                id="bigPicHead"
                                className="text-blue-2 flex items-center "
                            >
                                <span>
                                    {`<${evtTypeMap.get(curEvtType)?.d}>事件大图展示(${eventsImageFiltered.length === 0 ? "空" : eventsImageFiltered.length})`}
                                </span>
                                <div
                                    className="ml-10 px-2 h-8 leading-8 text-sm rounded-lg bg-gray-1 cursor-pointer hover:bg-gray-3 select-none text-black"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowTime((prev) => !prev);
                                    }}
                                >
                                    {showTime ? "时间隐藏" : "时间显示"}
                                </div>
                            </div>

                            <IconClose
                                className="text-lg text-gray-2 cursor-pointer"
                                onClick={() => {
                                    setShowPop(false);
                                }}
                            />
                        </div>
                        <div
                            id="bigPicContainer"
                            className="grid gap-0.5 px-4 pt-1 overflow-y-auto max-h-[calc(90vh-64px-64px)]"
                            style={{
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(200px, 1fr))",
                            }}
                        >
                            {eventsImageFiltered.map((item, index) => (
                                <LazyImage
                                    key={`player-image-${index}`}
                                    onClick={() => {
                                        if (videoRef.current === null) return;
                                        videoRef.current.currentTime =
                                            item.startRelTime;
                                        setLastChoosed(index);
                                        setShowPop(false);
                                    }}
                                    src={`api/video/screenshot?image_path=${item.src}`}
                                    className={twMerge(
                                        "aspect-video bg-[#d1d5dc] flex items-center justify-center  cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform",
                                        lastChoosed === index
                                            ? lastChoosed === index
                                                ? "border-2 border-blue-1"
                                                : ""
                                            : "",
                                    )}
                                >
                                    {item.absTime !== undefined && showTime && (
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
                            ))}
                        </div>
                    </div>
                </Popup>
            )}
        </div>
    );
}

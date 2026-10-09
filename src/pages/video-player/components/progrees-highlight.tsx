import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    allEvts2Statistics,
    calcPercent,
    calcTime,
    clamp,
    close2Zero,
    getCurEvtLists,
} from "../util";
import { EvtType } from "./events-type";

import { CertainEvtInfo } from "@/api/type";

interface ProgressHighLightProps {
    currentTime: number;
    totalTime: number;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
    eventsArr: CertainEvtInfo[];
    curEventType: EvtType;
    shouldSkip: boolean;
    carEventList: CertainEvtInfo[];
    otherEventList: CertainEvtInfo[];
    personEventList: CertainEvtInfo[];
    frameRate: number;
}

export interface TimeEvent {
    StartTime: number;
    Num: number;
}

function isInSections(
    curEvts: CertainEvtInfo[],
    frameRate: number,
    currentTime: number,
) {
    return curEvts.some(
        (evt) =>
            evt.Start / frameRate <= currentTime &&
            evt.End / frameRate > currentTime,
    );
}
function nextSectionTime(
    curEvts: CertainEvtInfo[],
    frameRate: number,
    currentTime: number,
    totalTime: number,
) {
    let res = totalTime;
    for (const evt of curEvts) {
        const startTime = evt.Start / frameRate;
        if (startTime >= currentTime) {
            res = startTime;
            break;
        }
    }
    return res;
}
function lastSectionTime(
    curEvts: CertainEvtInfo[],
    frameRate: number,
    currentTime: number,
) {
    let res = 0;
    for (let i = curEvts.length - 1; i >= 0; i--) {
        const evt = curEvts[i];
        const startTime = evt.Start / frameRate;
        const endTime = evt.End / frameRate;
        if (endTime < currentTime) {
            res = startTime;
            break;
        }
        if (startTime <= currentTime && endTime > currentTime && i > 0) {
            res = curEvts[i - 1].Start / frameRate;
            break;
        }
    }
    return res;
}

function diff(
    timeEvts: { startTime: number; endTime: number }[],
    totalTime: number,
) {
    // 使用差分数组计算每个时间点有多少个事件发生
    const inOrOut = Array(Math.floor(totalTime + 1)).fill(0); // 每个时间点区间进出情况
    for (const timeEvt of timeEvts) {
        inOrOut[timeEvt.startTime] += 1;
        if (timeEvt.endTime + 1 <= totalTime) inOrOut[timeEvt.endTime + 1] -= 1;
    }
    const result: number[] = Array(Math.floor(totalTime + 1)).fill(0);
    result[0] = inOrOut[0];
    for (let i = 1; i < totalTime; i++) {
        result[i] = result[i - 1] + inOrOut[i];
    }
    return result;
}

const ProgressHighLight = memo(
    ({
        currentTime,
        totalTime,
        setCurrentTime,
        videoRef,
        setIsPaused,
        eventsArr,
        curEventType,
        shouldSkip,
        carEventList,
        personEventList,
        otherEventList,
        frameRate,
    }: ProgressHighLightProps) => {
        const svgWidth = 1000;
        const frameRateRef = useRef(frameRate);
        frameRateRef.current = frameRate;
        const [path, setPath] = useState("");
        const handleSvgClick = (
            e: React.MouseEvent<SVGSVGElement, MouseEvent>,
        ) => {
            if (svgRef.current !== null && videoRef.current !== null) {
                const rect = svgRef.current.getBoundingClientRect();
                const jumpRatio = (e.clientX - rect.left) / rect.width;
                const jumpTime = jumpRatio * totalTime;
                setCurrentTime(jumpTime);
                videoRef.current.currentTime = jumpTime;
                videoRef.current.play();
                setIsPaused(false);
            }
        };
        const [tipLeft, setTipLeft] = useState(0);
        const [tipTime, setTipTime] = useState(0);
        const [showTip, setShowTip] = useState(false);
        const tipRef = useRef<HTMLDivElement>(null);
        const handleSvgMove = (
            e: React.MouseEvent<SVGSVGElement, MouseEvent>,
        ) => {
            if (
                svgRef.current !== null &&
                videoRef.current !== null &&
                tipRef.current !== null
            ) {
                const rect = svgRef.current.getBoundingClientRect();
                const selfWidth = tipRef.current.getBoundingClientRect().width;
                const noClampLeft =
                    e.clientX - rect.left + fatherPaddingLeft - selfWidth / 2;
                const jumpTime =
                    ((e.clientX - rect.left) / rect.width) * totalTime;
                setTipTime(jumpTime);
                const finalLeft = clamp(
                    noClampLeft,
                    fatherPaddingLeft,
                    rect.width + fatherPaddingLeft - selfWidth,
                );
                setTipLeft(finalLeft);
            }
        };
        const svgRef = useRef<SVGSVGElement>(null);
        const initVal = useMemo(() => {
            return allEvts2Statistics(
                totalTime,
                eventsArr,
                curEventType,
                frameRate,
            ).Data.info;
        }, [totalTime, eventsArr, curEventType, frameRate]);
        const eventsRef = useRef(initVal);
        const currentTimeRef = useRef(currentTime);
        const totalTimeRef = useRef(totalTime);

        useEffect(() => {
            if (close2Zero(totalTime)) return;
            const info = allEvts2Statistics(
                totalTime,
                eventsArr,
                curEventType,
                frameRate,
            ).Data.info;
            eventsRef.current = info;
            const pureNum = info.map((item) => item.Num);
            const maxNum: number = pureNum.reduce((a, b) => Math.max(a, b), -1);
            const minNum: number = pureNum.reduce(
                (a, b) => Math.min(a, b),
                Infinity,
            );
            const normalized = info.map((item) => {
                return {
                    posX: (svgWidth * (item.StartTime / totalTime)).toFixed(1),
                    num: (
                        100 -
                        100 * calcPercent(item.Num, minNum, maxNum)
                    ).toFixed(1),
                };
            });
            const lineChartDrawPath = normalized.map(
                (item) => `L ${item.posX} ${item.num}`,
            );

            const finalPath = "M 0 100 " + lineChartDrawPath + " L 1000 100 Z";

            setPath(finalPath);
        }, [totalTime, eventsArr, curEventType, frameRate]);
        const findNearestNeighbor = (tipTime: number) => {
            return evtNumsPerTime[Math.floor(clamp(tipTime, 0, totalTime))];
        };

        // 父元素 px-3
        const fatherPaddingLeft = 3 * 4;

        // 去更新回调函数所需要的状态
        useEffect(() => {
            totalTimeRef.current = totalTime;
        }, [totalTime]);
        useEffect(() => {
            currentTimeRef.current = currentTime;
        }, [currentTime]);

        // 控制自动跳转
        const curEvtsRef = useRef<CertainEvtInfo[]>([]);
        const curEvts = useMemo(() => {
            const res = getCurEvtLists(
                personEventList ?? [],
                otherEventList ?? [],
                carEventList ?? [],
                curEventType ?? [],
            );
            curEvtsRef.current = res;
            return res;
        }, [carEventList, curEventType, otherEventList, personEventList]);
        // 缓存diff数组
        const evtNumsPerTime = useMemo(() => {
            const timeEvts = curEvts.map((item) => ({
                startTime: Math.round(item.Start / frameRate),
                endTime: Math.round(item.End / frameRate),
            }));
            return diff(timeEvts, totalTime);
        }, [curEvts, frameRate, totalTime]);

        // 自动跳转的effect
        const sectionJump = useCallback(
            (
                currentTime: number,
                totalTime: number,
                curEvents: CertainEvtInfo[],
                direction: "a" | "d",
                frameRate: number,
            ) => {
                if (videoRef.current === null) return;
                const nextTime =
                    direction === "a"
                        ? lastSectionTime(curEvents, frameRate, currentTime)
                        : nextSectionTime(
                              curEvents,
                              frameRate,
                              currentTime,
                              totalTime,
                          );

                setCurrentTime(nextTime);
                videoRef.current.currentTime = nextTime;
                if (totalTimeRef.current === nextTime) {
                    videoRef.current.pause();
                    setIsPaused(true);
                } else {
                    videoRef.current.play();
                    setIsPaused(false);
                }
            },
            [videoRef],
        );
        useEffect(() => {
            if (
                !shouldSkip ||
                videoRef.current === null ||
                totalTimeRef.current === null
            )
                return;
            const autoJump = setInterval(() => {
                // 检查是否落在curEvts的区间内
                if (isInSections(curEvts, frameRate, currentTime)) return;
                sectionJump(currentTime, totalTime, curEvts, "d", frameRate);
            }, 250);
            return () => {
                clearInterval(autoJump);
            };
        }, [
            curEvts,
            currentTime,
            shouldSkip,
            videoRef,
            frameRate,
            sectionJump,
            totalTime,
            curEventType,
        ]);
        // 新progress-highlight
        const [newPath, setNewPath] = useState("");
        useEffect(() => {
            if (close2Zero(totalTime)) return;
            const maxNum: number = evtNumsPerTime.reduce(
                (a, b) => Math.max(a, b),
                -1,
            );
            const minNum: number = evtNumsPerTime.reduce(
                (a, b) => Math.min(a, b),
                Infinity,
            );
            const normalized = evtNumsPerTime.map((item, index) => {
                // index就是时间点
                return {
                    posX: (svgWidth * (index / totalTime)).toFixed(1),
                    num: (
                        100 -
                        100 * calcPercent(item, minNum, maxNum)
                    ).toFixed(1),
                };
            });
            const reducedNormalized = normalized.filter((item, index) => {
                if (index === 0 || index === normalized.length - 1) {
                    return true;
                }
                if (
                    item.num === normalized[index - 1].num &&
                    item.num === normalized[index + 1].num
                )
                    return false;
                return true;
            });

            const lineChartDrawPath = reducedNormalized.map(
                (item) => `L ${item.posX} ${item.num}`,
            );

            const finalPath = "M 0 100 " + lineChartDrawPath + " L 1000 100 Z";
            setNewPath(finalPath);
        }, [curEvts, frameRate, totalTime]);

        // 绑定快速跳转事件
        const quickJump = (e: KeyboardEvent) => {
            if (videoRef.current == null) return;
            const eLowercase = e.key.toLowerCase();
            if (eLowercase !== "a" && eLowercase !== "d") return;
            sectionJump(
                currentTimeRef.current,
                totalTimeRef.current,
                curEvtsRef.current,
                eLowercase,
                frameRateRef.current,
            );
        };
        useEffect(() => {
            window.addEventListener("keyup", quickJump);
            return () => {
                window.removeEventListener("keyup", quickJump);
            };
        }, []);

        return (
            !close2Zero(totalTime) && (
                <>
                    <div className="absolute bottom-[calc(100%+1px)] left-0 w-full h-7 leading-7 px-3 -z-1 ">
                        {showTip && newPath !== "" && (
                            <div
                                className="px-4 h-15 min-w-[120px] bg-black absolute bottom-7 text-white text-xs flex justify-center items-center flex-col rounded-2xl"
                                ref={tipRef}
                                style={{
                                    left: tipLeft,
                                }}
                            >
                                <div className=" ">
                                    时间点: {calcTime(tipTime)}
                                </div>
                                <div className="">
                                    附近事件数: {findNearestNeighbor(tipTime)}
                                </div>
                            </div>
                        )}
                        <div className="w-full h-7">
                            <svg
                                viewBox="0 0 1000 100"
                                preserveAspectRatio="none"
                                width="100%"
                                height="100%"
                                fillOpacity={"0"}
                                onClick={handleSvgClick}
                                onMouseMove={handleSvgMove}
                                onMouseEnter={() => {
                                    setShowTip(true);
                                }}
                                onMouseLeave={() => {
                                    setShowTip(false);
                                }}
                                ref={svgRef}
                                className="cursor-pointer"
                            >
                                <defs>
                                    <clipPath
                                        id="bpx-player-pbp-curve-path"
                                        clipPathUnits="userSpaceOnUse"
                                    >
                                        <path d={newPath}></path>
                                    </clipPath>
                                    <clipPath
                                        id="bpx-player-pbp-played-path"
                                        clipPathUnits="userSpaceOnUse"
                                    >
                                        <path
                                            d={`M 0.0 100 H ${(currentTime / totalTime) * svgWidth} V 0 H 0.0 Z`}
                                        ></path>
                                    </clipPath>
                                </defs>
                                <g
                                    fillOpacity="1"
                                    clipPath="url(#bpx-player-pbp-curve-path)"
                                    // class="bpx-player-pbp-videoshot"
                                >
                                    <rect
                                        x="0"
                                        y="0"
                                        width="100%"
                                        height="100%"
                                        fill="rgba(255, 255, 255,0.8)"
                                    ></rect>
                                    <rect
                                        x="0"
                                        y="0"
                                        width="100%"
                                        height="100%"
                                        fill="var(--bpx-primary-color, #00a1d6)"
                                        fillOpacity={"0.5"}
                                        clipPath="url(#bpx-player-pbp-played-path)"
                                    ></rect>
                                </g>
                            </svg>
                        </div>
                    </div>
                </>
            )
        );
    },
);
ProgressHighLight.displayName = "ProgressHighLight";
export default ProgressHighLight;

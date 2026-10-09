import { MouseEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PauseIcon from "./assets/pause.svg?react";
import PlayIcon from "./assets/play.svg?react";
import ToPlayIcon from "./assets/youtube_play.svg?react";
import { VideoStatus } from "./common";
import EventsList from "./components/events-list/events-list";
import VideoEvtTypeSelector, { EvtType } from "./components/events-type";
import FastPlayBackHint from "./components/fast-playback";
import ProgressHighLight from "./components/progrees-highlight";
import Loading from "./components/status/loading";
import NotFound from "./components/status/notfound";
// import VideoCapture from "./components/video-capture";
import VideoFullScreen from "./components/video-fullscreen";
import VideoHead from "./components/video-head";
import VideoProgress from "./components/video-progress";
import VideoSkip from "./components/video-skip";
import VideoSpeed from "./components/video-speed";
import VideoTag from "./components/video-tag";
import VideoVolumn from "./components/video-volumn";
import VolumnHint from "./components/volumn-hint";
import { calcTime, clamp, GetVideoStatusAndID } from "./util";
import "./video-player.css";
import VideoROI from "./video-roi";

import { api } from "@/api/index";
import { AllEventsInfo, VideoInfo } from "@/api/type";
import { useVideoTime } from "@/hooks/useVideoTime";

export default function VideoPlayer() {
    const [isHovered, setIsHovered] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const hoveredTimer = useRef(-1);
    const computeIsHovered = isHovered;
    const [eventType, setEventType] = useState(EvtType.All);
    // const computeIsHovered = true;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPaused(false);
        } else {
            videoRef.current.pause();
            setIsPaused(true);
        }
    };
    // 视频总时间显示
    const [duration, setDuration] = useState(0); // 总时间
    const durationRef = useRef(0);
    const [currentTime, setCurrentTime] = useState(0); // 当前时间
    const setMetaDuration = () => {
        if (videoRef.current === null) return;
        setDuration(videoRef.current.duration);
        durationRef.current = videoRef.current.duration;
        setStatus(VideoStatus.Normal);
    };
    // 视频跳过控制
    const [shouldSkip, setShouldSkip] = useState(false);
    // 后端交互
    const [searchParams] = useSearchParams("id");
    const res = GetVideoStatusAndID(searchParams);
    const [status, setStatus] = useState(res.status);
    const [innerLoading, setInnerLoading] = useState(false); // 控制跳转时的loading
    const [videoID, setVideoID] = useState(res.videoID);
    const [videoInfo, setVideoInfo] = useState<VideoInfo>({
        Message: "",
        Data: {
            Name: "等待加载...",
            Duration: 0,
            UploadTime: Date().toString(),
        },
    });
    const [leftContainerWidth, setLeftContainerWidth] = useState(
        getLeftContainerSize(),
    );
    // 获取视频基本信息
    const [eventsList, setEventsList] = useState<AllEventsInfo>({
        Meassage: "",
        Data: {
            roi: {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            },
            PersonEventList: [],
            CarEventList: [],
            OtherEventList: [],
            BaseTime: undefined,
            FrameRate: 1,
            MotionRatio: 0,
            Resolution: "",
            TotalFrame: 0,
            Events: [],
            total_time: 0,
            processed_time: 0,
        },
    });

    // 设置定时器更新当前时间
    useEffect(() => {
        if (videoRef.current === null) {
            console.log("未能成功设置播放定时器");
            return;
        }
        const interval = setInterval(() => {
            if (videoRef.current !== null) {
                setCurrentTime(videoRef.current!.currentTime);
            }
        }, 250);
        return () => clearInterval(interval);
    }, [videoID]);

    // 键盘控制
    const [isManualFastPlayBack, setIsManualFastPlayBack] = useState(false); // RightArrow倍速播放控制
    const prevPlayBack = useRef({ rate: 1, lock: false });
    const fastPlayBackThreshold = 300;
    const rightArrowDownTime = useRef(-1);
    const videoJumpFromNow = (seconds: number) => {
        if (videoRef.current !== null) {
            const destination = clamp(
                videoRef.current.currentTime + seconds,
                0,
                durationRef.current,
            );
            setCurrentTime(destination);
            videoRef.current.currentTime = destination;
            videoRef.current.play();
            setIsPaused(false);
        }
    };
    // 音量控制
    const [volumn, setVolumn] = useState(1);
    const [showVolHint, setShowVolHint] = useState(false);
    const [randTrigger, setRandTrigger] = useState(0); // 一个变化的数字用于让hint持续显示
    useEffect(() => {
        if (videoRef.current !== null) {
            videoRef.current.volume = volumn;
        }
    }, [volumn]);
    // 键盘点击事件注册
    const [isFullScreen, setIsFullScreen] = useState(false);
    const isFullScreenRef = useRef(isFullScreen);
    useEffect(() => {
        isFullScreenRef.current = isFullScreen;
    }, [isFullScreen]); // 方便callback拿到最新值
    const handleKeyDown = (e: KeyboardEvent) => {
        if (videoRef.current === null) return;
        if (e.key === " ") {
            e.preventDefault();
            togglePlayPause();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            if (!prevPlayBack.current.lock) {
                prevPlayBack.current.rate = videoRef.current.playbackRate;
                prevPlayBack.current.lock = true;
                rightArrowDownTime.current = Date.now();
            }
            // 按住时长达到阈值，触发倍速播放
            if (
                rightArrowDownTime.current !== -1 &&
                Date.now() - rightArrowDownTime.current >= fastPlayBackThreshold
            ) {
                videoRef.current.playbackRate = 10;
                videoRef.current.play();
                setIsManualFastPlayBack(true);
                setIsPaused(false);
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            videoJumpFromNow(-5);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const curVol = videoRef.current.volume;
            const newVol = clamp(curVol + 0.1, 0, 1);
            setVolumn(newVol);
            setShowVolHint(true);
            setRandTrigger((prev) => (prev + 1) % 100);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const curVol = videoRef.current.volume;
            const newVol = clamp(curVol - 0.1, 0, 1);
            setVolumn(newVol);
            setShowVolHint(true);
            setRandTrigger((prev) => (prev + 1) % 100);
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (videoRef.current === null) return;
        if (e.key === "ArrowRight") {
            e.preventDefault();
            //区分是倍速播放的情况还是轻击快进
            if (
                rightArrowDownTime.current !== -1 &&
                Date.now() - rightArrowDownTime.current >= fastPlayBackThreshold
            ) {
                videoRef.current.playbackRate = prevPlayBack.current.rate;
                setIsManualFastPlayBack(false);
            } else {
                videoJumpFromNow(5);
            }
            prevPlayBack.current.lock = false;
            rightArrowDownTime.current = -1;
        }
    };
    const handleDoubleClick = () => {
        if (containerRef.current !== null) {
            if (isFullScreenRef.current) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };
    const handleResize = () => {
        setLeftContainerWidth(getLeftContainerSize());
    };
    const handleVisChange = () => {
        if (document.hidden === false) {
            if (videoRef.current === null) return;
            // 暂时就先不使用，先不用来解决8倍速的问题
            // videoRef.current.play();
            // setIsPaused(false);
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        window.addEventListener("resize", handleResize);
        document.addEventListener("visibilitychange", handleVisChange);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // 与后端交互,获得视频基本信息
    useEffect(() => {
        const res = GetVideoStatusAndID(searchParams);
        setVideoID(res.videoID);
        setStatus(res.status);
    }, []);
    // 获取事件信息
    useEffect(() => {
        if (videoID !== -1) {
            const fetch_data = async () => {
                try {
                    const [videoInfoRes, allEvents] = await Promise.all([
                        api.player.videoInfo(videoID),
                        api.player.allEvents(videoID),
                    ]);

                    setVideoInfo(videoInfoRes);
                    console.log("allevents", allEvents);
                    setEventsList(allEvents);
                } catch (error) {
                    console.error("请求失败:", error);
                }
            };
            fetch_data();
        }
    }, [videoID]);
    const roi = eventsList.Data.roi;
    // 默认跳转
    const startTime = useVideoTime();
    const [hasSeeked, setHasSeeked] = useState(false);
    useEffect(() => {
        const video = videoRef.current;
        if (!video || hasSeeked || startTime <= 0) return;
        const handleCanPlay = () => {
            video.currentTime = startTime;
            video.play();
            setIsPaused(false);
            setHasSeeked(true);
        };
        video.addEventListener("canplay", handleCanPlay);
        return () => {
            video.removeEventListener("canplay", handleCanPlay);
        };
    }, [startTime, hasSeeked]);

    return status === VideoStatus.LoadFailed ? (
        <NotFound msg="视频资源加载失败或不存在" />
    ) : status === VideoStatus.IDInvalid ? (
        <NotFound msg="非法视频ID" />
    ) : (
        <div
            id="dml-total-container"
            className="max-w-[2540px] min-w-[1080px] h-[700px] mx-auto px-2.5 box-content
     flex justify-center relative"
        >
            <div
                id="dml-left-container"
                className=" min-w-[668px] max-w-[1354px]"
                style={{ width: leftContainerWidth }}
            >
                <VideoHead
                    videoName={videoInfo.Data.Name}
                    uploadTime={videoInfo.Data.UploadTime}
                ></VideoHead>
                <div
                    id="dml-video-container"
                    className="aspect-video relative bg-black"
                    ref={containerRef}
                    onMouseLeave={() => {
                        setIsHovered(false);
                    }}
                    onMouseMove={() => {
                        setIsHovered(true);
                        clearTimeout(hoveredTimer.current);
                        hoveredTimer.current = setTimeout(() => {
                            setIsHovered(false);
                        }, 2000);
                    }}
                >
                    {status === VideoStatus.Loading && (
                        <Loading transparent={false} />
                    )}
                    {/* {innerLoading && <Loading transparent={true} />} */}
                    {/* 太过频繁loading，暂时取消 */}
                    <video
                        src={`/api/video/stream?video_id=${videoID}`}
                        ref={videoRef}
                        onClick={togglePlayPause}
                        onLoadedMetadata={setMetaDuration}
                        onEnded={() => {
                            setIsPaused(true);
                        }}
                        onCanPlay={() => {
                            // setInnerLoading(false);
                            console.log("can play");
                        }}
                        onWaiting={() => {
                            // setInnerLoading(true);
                            console.log("waiting");
                        }}
                        onError={() => {
                            setStatus(VideoStatus.LoadFailed);
                            console.log("on Error, set not found true");
                        }}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            cursor: isHovered ? "default" : "none",
                        }}
                        className="w-full h-full object-contain overflow-clip m-auto"
                    />
                    {isPaused && (
                        <div
                            id="dml-to-play-icon"
                            className={`absolute right-[34px] w-16 h-16 pointer-events-none ${isFullScreen ? "bottom-[107px]" : "bottom-[62px]"} `}
                        >
                            <ToPlayIcon />
                        </div>
                    )}
                    <VolumnHint
                        volumn={volumn}
                        showHint={showVolHint}
                        setShowHint={setShowVolHint}
                        randTriggerShowHint={randTrigger}
                    />
                    <div
                        id="dml-player-control"
                        className={`absolute bottom-0 left-0 w-full h-[55px] z-20
                       px-3 transition-opacity duration-300 
                    ${computeIsHovered ? "opacity-100" : "opacity-0"} text-white 
                    ${isFullScreen ? "h-[73px]" : "h-[55px]"}
                    flex justify-between items-center`}
                        onMouseEnter={() => {
                            clearTimeout(hoveredTimer.current);
                            setIsHovered(true);
                        }}
                        onMouseMove={(e: MouseEvent) => {
                            e.stopPropagation();
                        }} // 防止触发父元素move
                    >
                        <VideoProgress
                            videoRef={videoRef}
                            duration={duration}
                            currentTime={currentTime}
                            setCurrentTime={setCurrentTime}
                            setIsPaused={setIsPaused}
                        />
                        <ProgressHighLight
                            currentTime={currentTime}
                            totalTime={duration}
                            videoRef={videoRef}
                            setCurrentTime={setCurrentTime}
                            setIsPaused={setIsPaused}
                            eventsArr={[
                                ...eventsList.Data.CarEventList,
                                ...eventsList.Data.PersonEventList,
                                ...eventsList.Data.OtherEventList,
                            ].sort((a, b) => a.Start - b.Start)}
                            // eventsArr={eventsList.Data.Events}
                            curEventType={eventType}
                            shouldSkip={shouldSkip}
                            carEventList={eventsList.Data.CarEventList}
                            personEventList={eventsList.Data.PersonEventList}
                            otherEventList={eventsList.Data.OtherEventList}
                            frameRate={eventsList.Data.FrameRate}
                        />
                        <div
                            id="dml-control-left"
                            className=" h-10 flex items-center  pl-2 pr-3 relative bg-black/40 rounded-lg  "
                        >
                            <div
                                id="dml-control-playswitch"
                                className="w-9 h-6 mr-2 cursor-pointer "
                                onClick={() => {
                                    togglePlayPause();
                                }}
                            >
                                {isPaused ? <PlayIcon /> : <PauseIcon />}
                            </div>
                            <div
                                id="dml-controeventStatisticsl-timetip"
                                className="text-xs text-white"
                            >
                                {calcTime(currentTime)} / {calcTime(duration)}
                            </div>
                        </div>
                        <div
                            id="dml-control-right"
                            className=" h-10 flex items-center"
                        >
                            <VideoSkip setShouldSkip={setShouldSkip} />
                            {roi !== undefined &&
                                roi.h !== null &&
                                roi.w !== null &&
                                roi.x !== null &&
                                roi.y !== null && (
                                    <VideoROI
                                        videoRef={videoRef}
                                        containerRef={containerRef}
                                        resolution={
                                            eventsList.Data.Resolution ??
                                            "1920x1080"
                                        }
                                        roi={roi}
                                    />
                                )}
                            <VideoEvtTypeSelector
                                curEvtType={eventType}
                                setCurEvtType={setEventType}
                            />
                            <VideoSpeed videoRef={videoRef} />
                            <VideoVolumn
                                volumn={volumn}
                                setVolumn={setVolumn}
                            />
                            {/* <VideoCapture
                                videoRef={videoRef}
                                containerRef={containerRef}
                                setIsPaused={setIsPaused}
                            /> */}
                            <VideoFullScreen
                                containerRef={containerRef}
                                isFull={isFullScreen}
                                setIsFull={setIsFullScreen}
                            />
                        </div>
                    </div>
                    <div
                        id="dml-player-mask"
                        style={{
                            background:
                                "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==) repeat-x bottom",
                        }}
                        className={`absolute left-0 bottom-0 h-25 w-full z-10
                   pointer-events-none 
                   transition-opacity duration-200 ${computeIsHovered ? "opacity-100" : "opacity-0"}`}
                    />
                    {isManualFastPlayBack && <FastPlayBackHint />}
                </div>
                <VideoTag allEvent={eventsList} />
            </div>
            <div
                id="dml-right-container"
                className="w-[350px] ml-[30px] min-[1681px]:w-[411px]  pt-[104px] "
            >
                <EventsList
                    videoRef={videoRef}
                    curEvtType={eventType}
                    personEvents={eventsList.Data.PersonEventList}
                    carEvents={eventsList.Data.CarEventList}
                    otherEvents={eventsList.Data.OtherEventList}
                    frameRate={eventsList.Data.FrameRate}
                />
            </div>
        </div>
    );
}

function getLeftContainerSize() {
    const i = window.innerHeight,
        t = Math.max(
            (document.body && document.body.clientWidth) || window.innerWidth,
            1100,
        ),
        n = 1680 < innerWidth ? 411 : 350,
        r = parseInt(
            ((16 * (i - (1690 < innerWidth ? 318 : 308))) / 9).toString(),
        ),
        o = t - 112 - n;
    let a = o < r ? o : r;
    if (a < 668) a = 668;
    if (a > 1694) a = 1694;
    return a;
}

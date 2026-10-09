import { Tooltip } from "antd";
import { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { urlCurEvtType, urlPicGenre } from "../bigpic";
import { CategoryGroup } from "./components/category-group";
import FaceControlSlidebar from "./components/face-control";
import ImageDetailPopup from "./components/image-pop";
import OrderShowtimeGroup from "./components/order-and-showtime";
import PicGenreToggle from "./components/picture-genre";
import { EventsImage } from "../video-player/components/events-list/events-list";
import { calcTime } from "../video-player/util";
import { isOther } from "./components/util";

import { api } from "@/api";
import { BigPicPagePerRes, type2BackendTagID } from "@/api/type";
import {
    IconAttatch,
    IconDeleteUpload,
    IconEmpty,
    IconSearch,
} from "@/assets/svg";
import LazyImage from "@/components/image";
import { Pagination } from "@/components/pagination";
import { $Search } from "@/store/search";
import { date2ChineseString } from "@/util/time";
export interface SearchTarget {
    curPage: number;
    curEvtType: urlCurEvtType;
    curPicGenre: urlPicGenre;
    sortOrder: number;
    keywords: string | undefined;
    sort_field_id: number;
    face_quality_threshold: number;
    clarity_quality_threshold: number;
    videoId: number; // 如果你专门想看某个video的话
}
export interface ImageInfo {
    imgSrc: string;
    relTime: number;
    absTime: Date;
    vid: number;
    evtId?: number;
    isOther?: boolean;
}
export type TimeRange = [Dayjs, Dayjs] | [undefined, undefined];

type SortStrategy = (a: EventsImage, b: EventsImage) => number;
function getSortStrategy(
    sort_order_id: number,
    sort_field_id: number,
): SortStrategy {
    // order: 0 升序 1降序
    // field: 0 时间 1文本
    if (sort_field_id === 0 && sort_order_id === 0) {
        // console.log("采取 时间 升序 策略");
        return (a, b) => a.absTime.getTime() - b.absTime.getTime();
    } else if (sort_field_id === 0 && sort_order_id === 1) {
        // console.log("采取 时间 降序 策略");
        return (a, b) => b.absTime.getTime() - a.absTime.getTime();
    } else {
        // console.log("采取 文本分数 降序 策略");
        return (a, b) => b.textScore - a.textScore;
    }
}

export default function NewBigPic() {
    const loadedImage = $Search.use((s) => s.image);
    const [loadedImageURL, setLoadedImageURL] = useState(
        loadedImage ? URL.createObjectURL(loadedImage) : null,
    );
    useEffect(() => {
        if (loadedImage) {
            setLoadedImageURL(URL.createObjectURL(loadedImage));
        } else {
            setLoadedImageURL(null);
        }
    }, [loadedImage]);
    const [showTime, setShowTime] = useState(true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const navigate = useNavigate();

    const [searchTarget, setSearchTarget] = useState<SearchTarget>({
        curPage: Number(searchParams.get("page") ?? 1),
        curEvtType: (searchParams.get("type") as urlCurEvtType) ?? "all",
        curPicGenre: (searchParams.get("genre") as urlPicGenre) ?? "png",
        sortOrder: Number(searchParams.get("order") ?? 0),
        keywords: searchParams.get("keywords") || "",
        sort_field_id: Number(searchParams.get("sort_field_id")) || 0,
        face_quality_threshold:
            Number(searchParams.get("face_quality_threshold")) || 20,
        clarity_quality_threshold:
            Number(searchParams.get("clarity_quality_threshold")) || 100,
        videoId: Number(searchParams.get("videoId")) || -1,
    });
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setSearchTarget({
            curPage: Number(searchParams.get("page") ?? 1),
            curEvtType: (searchParams.get("type") as urlCurEvtType) ?? "all",
            curPicGenre: (searchParams.get("genre") as urlPicGenre) ?? "png",
            sortOrder: Number(searchParams.get("order") ?? 0),
            keywords: searchParams.get("keywords") || "",
            sort_field_id: Number(searchParams.get("sort_field_id")) || 0,
            face_quality_threshold:
                Number(searchParams.get("face_quality_threshold")) || 20,
            clarity_quality_threshold:
                Number(searchParams.get("clarity_quality_threshold")) || 100,
            videoId: Number(searchParams.get("videoId")) || -1,
        });
    }, [location]);

    useEffect(() => {
        console.log("searchTarget changed to ", searchTarget);
    }, [searchTarget]);

    const newSearchNavi = useCallback(
        (newTarget: Partial<SearchTarget>) => {
            console.log("in new search navi, received", newTarget);

            // 合并默认值（searchTarget）和新值（newTarget）
            const merged: SearchTarget = {
                ...searchTarget,
                ...newTarget,
            };

            // 特殊逻辑处理
            let keywords = merged.keywords;

            // if (merged.curPicGenre === "gif" || merged.curEvtType === "face") {
            //     keywords = "";
            //     setSearchKeywords("");
            // }
            if (merged.curEvtType === "face") {
                keywords = "";
                setSearchKeywords("");
            }

            // 构造 query 参数
            const params = new URLSearchParams({
                page: String(merged.curPage),
                genre: String(merged.curPicGenre),
                type: String(merged.curEvtType),
                order: String(merged.sortOrder),
                keywords: keywords ?? "",
                sort_field_id: String(merged.sort_field_id),
                face_quality_threshold: String(merged.face_quality_threshold),
                clarity_quality_threshold: String(
                    merged.clarity_quality_threshold,
                ),
                videoId: String(merged.videoId),
            });

            const newPath = `${location.pathname}?${params.toString()}`;
            console.log("in newsearch navi newPath", newPath);
            navigate(newPath);
        },
        [location.pathname, navigate, searchTarget],
    );

    const [searchKeywords, setSearchKeywords] = useState<string>(
        searchTarget.keywords || "",
    );
    const [loading, setLoading] = useState(true);

    const bigPicContainerRef = useRef<HTMLDivElement>(null);
    const { taskId } = useParams();
    const [total, setTotal] = useState<number>(1);
    const PerPage = 6 * 10;
    const [timeRange, setTimeRange] = useState<TimeRange>([
        undefined,
        undefined,
    ]);
    const [allEvents, setAllEvents] = useState<BigPicPagePerRes[]>([]);

    // 发送请求
    useEffect(() => {
        const fetchData = async () => {
            if (taskId === undefined) return;
            setLoading(true);
            setTotal(0);
            const pageRes = await api.task.bigpicPage(
                Number(taskId),
                searchTarget.curPicGenre,
                type2BackendTagID.get(searchTarget.curEvtType),
                searchTarget.curPage - 1,
                PerPage,
                searchTarget.sortOrder,
                timeRange[0],
                timeRange[1],
                searchTarget.keywords !== undefined
                    ? searchTarget.keywords.trim()
                    : undefined,
                searchTarget.sort_field_id,
                loadedImage,
                searchTarget.face_quality_threshold,
                searchTarget.clarity_quality_threshold,
                searchTarget.videoId,
            );
            setAllEvents(
                pageRes.Data && pageRes.Data.list ? pageRes.Data.list : [],
            );
            setLoading(false);
            setTotal(pageRes?.Data.total);
        };
        fetchData();
    }, [PerPage, loadedImage, searchTarget, taskId, timeRange]);
    const eventsFiltered = useMemo(() => {
        const a: EventsImage[][] = allEvents.map((video) => {
            if (searchTarget.curPicGenre === "gif") {
                // 展示GIFd
                if (video.GifEvents === null) return [];
                return video.GifEvents.map((item) => {
                    const plus8Time = new Date(item.Time);
                    plus8Time.setHours(plus8Time.getHours());
                    return {
                        src: item.Gif,
                        startRelTime: Math.floor(item.Start / video.FrameRate),
                        absTime: plus8Time,
                        vid: video.videoId,
                        textScore: 0, // 默认为0，现在没有score
                        // GIF没有Id
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
                              if (searchTarget.sortOrder === 0) {
                                  return at.getTime() - bt.getTime();
                              } else {
                                  return bt.getTime() - at.getTime();
                              }
                          })
                        : [];

                const dealtEvts: EventsImage[] = evts.map((item) => {
                    return {
                        src: item.ScreenShot,
                        startRelTime: item.ScreenShotIndex
                            ? Math.floor(item.ScreenShotIndex / video.FrameRate)
                            : Math.floor(item.Start / video.FrameRate),
                        absTime: new Date(item.Time),
                        vid: video.videoId,
                        textScore: item.TextScore,
                        caption: item.Caption,
                        hitString: item.HitString,
                        eId: item.Id,
                        isOther: isOther(item.TagId),
                    };
                });
                return dealtEvts;
            }
        });
        const sort_strategy = getSortStrategy(
            searchTarget.sortOrder,
            searchTarget.sort_field_id,
        );
        const sort_flat_a = a.flat().sort(sort_strategy);
        console.log("after sort", sort_flat_a);
        return sort_flat_a;
    }, [allEvents, searchTarget]);

    // 大图展示
    const [showPop, setShowPop] = useState<boolean>(false);
    const [curImgInfo, setCurImgInfo] = useState<ImageInfo>({
        imgSrc: "",
        relTime: 0,
        absTime: new Date(),
        vid: -1,
        evtId: -1,
        isOther: false,
    });
    // 绑定回车触发搜索
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                newSearchNavi({
                    keywords: searchKeywords,
                    sort_field_id: 1,
                    sortOrder: 1,
                    curPage: 1,
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [newSearchNavi, searchKeywords]);

    // 管理上传图片
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            $Search.update("setimage", (s) => {
                s.image = file;
            });
            setSearchKeywords("");
            newSearchNavi({
                keywords: "",
                curPage: 1,
            });
            // 在show-img里展示图片
            e.target.value = "";
        }
    };

    return (
        <div className="w-full min-h-full bg-gray-50 px-16 py-8">
            {/* 居中搜索栏 */}
            <div className="flex justify-center mb-6 h-12 ">
                <div className="relative w-full max-w-160 flex items-center border border-[#d1d5dc] rounded-xl shadow-sm overflow-hidden p-[5px]">
                    {/* {searchTarget.curPicGenre === "gif" && (
                        <div className="absolute inset-0 bg-[#6a7282] opacity-20"></div>
                    )} */}
                    {/* 左侧搜索图标 */}
                    <div className="pl-4 pr-2 text-[#00AEEC]">
                        <IconSearch />
                    </div>
                    <div className="h-full relative group">
                        {loadedImageURL !== null && (
                            <>
                                <img
                                    src={loadedImageURL}
                                    alt="loadedImage"
                                    className="h-full object-contain rounded-[4px]"
                                />
                                <button
                                    onClick={() => {
                                        $Search.update("setimage", (s) => {
                                            s.image = null;
                                        });
                                        setSearchKeywords("");
                                        newSearchNavi({
                                            keywords: "",
                                            curPage: 1,
                                        });
                                    }}
                                    className="w-3 h-3 absolute -top-1.5 left-[calc(100%-6px)]  opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                    <IconDeleteUpload />
                                </button>
                            </>
                        )}
                    </div>
                    {/* 中间输入框 */}
                    <input
                        type="text"
                        placeholder={
                            // searchTarget.curPicGenre === "gif"
                            //     ? "暂不支持动态图的搜索"
                            //     : searchTarget.curEvtType === "face"
                            //       ? "人脸搜索请利用右侧按钮上传图片搜索..."
                            //       : "输入图像关键词..."
                            searchTarget.curEvtType === "face"
                                ? "人脸搜索请利用右侧按钮上传图片搜索..."
                                : "输入图像关键词..."
                        }
                        disabled={searchTarget.curEvtType === "face"}
                        className={`flex-grow py-3 px-2 focus:outline-none focus:ring-0 ${searchTarget.curEvtType === "face" ? "cursor-not-allowed " : "cursor-text"}`}
                        onChange={(e) => {
                            setSearchKeywords(e.target.value);
                            console.log("searchKeywords", e.target.value);
                        }}
                        value={searchKeywords}
                    />
                    {/* 上传图片用的隐藏 input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                    />
                    <button
                        className="w-9 h-9 mr-1 border border-[#00000014] rounded-[10px] flex items-center justify-center transition hover:bg-[rgba(0,0,0,0.039)] cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <IconAttatch />
                    </button>
                    {/* 右侧按钮 */}
                    <button
                        className="bg-[rgb(0,174,236)]  text-white px-5  w-25 h-full hover:bg-[rgb(64,197,241)] transition rounded-xl cursor-pointer"
                        // disabled={searchTarget.curPicGenre === "gif"}
                        onClick={() => {
                            newSearchNavi({
                                keywords: searchKeywords,
                                sort_field_id: 1,
                                sortOrder: 1,
                                curPage: 1,
                            });
                            console.log(123);
                        }}
                    >
                        搜索
                    </button>
                </div>
            </div>

            <PicGenreToggle
                newSearchNavi={newSearchNavi}
                genre={searchTarget.curPicGenre}
                isFace={searchTarget.curEvtType === "face"}
                setSearchKeywords={setSearchKeywords}
                count={{
                    png:
                        searchTarget.curPicGenre === "png" &&
                        searchTarget.curEvtType !== "face" &&
                        !loading
                            ? total
                            : null,
                    gif:
                        searchTarget.curPicGenre === "gif" && !loading
                            ? total
                            : null,
                    face:
                        searchTarget.curEvtType === "face" && !loading
                            ? total
                            : null,
                }}
            />
            {/* 分割线 */}
            <div className="border-b border-solid border-gray-1 mb-5"></div>
            {/* 筛选按钮行 */}
            <div className="gap-4 mb-8">
                {searchTarget.curEvtType !== "face" && (
                    <CategoryGroup
                        newSearchNavi={newSearchNavi}
                        evtType={searchTarget.curEvtType}
                        setSearchKeywords={setSearchKeywords}
                        searchKeywords={searchKeywords}
                    />
                )}

                <OrderShowtimeGroup
                    setShowTime={setShowTime}
                    showTime={showTime}
                    newSearchNavi={newSearchNavi}
                    sortOrder={searchTarget.sortOrder}
                    setTimeRange={setTimeRange}
                    sortFieldID={searchTarget.sort_field_id}
                />
                {/* {searchTarget.curPicGenre === "png" &&
                    searchTarget.curEvtType == "face" && (
                        <FaceControlSlidebar
                            faceVal={searchTarget.face_quality_threshold}
                            faceCallback={(val: number) => {
                                if (
                                    val !== searchTarget.face_quality_threshold
                                ) {
                                    newSearchNavi({
                                        face_quality_threshold: val,
                                        curPage: 1,
                                    });
                                    console.log(
                                        "FACA_QUL",
                                        val,
                                        "ori:",
                                        searchTarget.face_quality_threshold,
                                    );
                                }
                            }}
                            clarityVal={searchTarget.clarity_quality_threshold}
                            clarityCallback={(val: number) => {
                                if (
                                    val !==
                                    searchTarget.clarity_quality_threshold
                                ) {
                                    newSearchNavi({
                                        clarity_quality_threshold: val,
                                        curPage: 1,
                                    });
                                    console.log(
                                        "CLAR_QUL",
                                        val,
                                        "ori:",
                                        searchTarget.clarity_quality_threshold,
                                    );
                                }
                            }}
                        ></FaceControlSlidebar>
                    )} */}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array(Math.floor(PerPage / 2))
                        .fill(0)
                        .map((_, index) => (
                            <LazyImage
                                key={`${searchTarget.curEvtType}-${searchTarget.curPicGenre}-${searchTarget.sortOrder}-image-${(searchTarget.curPage - 1) * PerPage + index}`}
                                src={""}
                                className="aspect-video bg-[#d1d5dc] flex items-center justify-center  cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform rounded-md overflow-hidden"
                            ></LazyImage>
                        ))}
                </div>
            ) : eventsFiltered.length === 0 ? (
                <div className="h-[30vh] flex justify-center items-center mt-30">
                    <div className="w-40 h-40">
                        <IconEmpty />
                        <div className="text-gray-400 text-xl mt-4 text-center">
                            事件数量为空！
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* 搜索结果网格容器 */}
                    <div
                        ref={bigPicContainerRef}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    >
                        {eventsFiltered.map((item, index) => (
                            <div
                                key={`${searchTarget.curEvtType}-${searchTarget.curPicGenre}-${searchTarget.sortOrder}-image-${(searchTarget.curPage - 1) * PerPage + index}`}
                            >
                                <LazyImage
                                    onClick={() => {
                                        setCurImgInfo({
                                            imgSrc: item.src,
                                            absTime: item.absTime,
                                            relTime: item.startRelTime,
                                            vid: item.vid!, // TODO:不敢不相信啊
                                            evtId: item.eId,
                                            isOther: item.isOther,
                                        });
                                        setShowPop(true);
                                    }}
                                    src={`api/video/screenshot?image_path=${item.src}`}
                                    className="aspect-video bg-[#d1d5dc] flex items-center justify-center  cursor-pointer hover:scale-[1.05] hover:z-10 transition-transform rounded-md overflow-hidden"
                                >
                                    {item.absTime !== undefined && showTime && (
                                        <div className="absolute left-0 top-0 z-[0] w-full h-6 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] pl-1  pb-1.5 opacity-100 transition-opacity">
                                            <div className=" text-white   text-[14px] leading-6">
                                                {date2ChineseString(
                                                    item.absTime,
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {showTime &&
                                        searchTarget.curEvtType === "face" &&
                                        searchTarget.curPicGenre === "png" && (
                                            <div className="absolute bottom-1.5 right-1.5 bg-black/40 h-5 leading-5 text-white px-1 text-[13px] rounded-xs ">
                                                {item.textScore !== 0
                                                    ? `相似度:${Math.floor(item.textScore * 100)}%`
                                                    : calcTime(
                                                          item.startRelTime,
                                                      )}
                                            </div>
                                        )}
                                </LazyImage>
                                {item.hitString !== "" &&
                                    searchTarget.curEvtType !== "face" &&
                                    searchTarget.curPicGenre === "png" && (
                                        <div className="mt-1 h-8 pr-[30px] box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer flex items-center ">
                                            <div className="mr-1 w-22 h-full p-2 bg-[#dff6fd] text-sm rounded-md flex justify-center items-center text-[#00aeec] shrink-0 text-[13px]">
                                                命中关键词
                                            </div>
                                            <Tooltip title={item.hitString}>
                                                <div className="text-[13px] text-[#9499a0] truncate">
                                                    {item.hitString}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                    {/* 分页 */}
                    <div className="flex justify-center mt-[50px] ">
                        <Pagination
                            defaultValue={searchTarget.curPage}
                            curPage={searchTarget.curPage}
                            total={Math.ceil(total / PerPage)}
                            onChange={(current) => {
                                if (bigPicContainerRef.current !== null) {
                                    bigPicContainerRef.current.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                }
                                newSearchNavi({
                                    curPage: current,
                                });
                            }}
                        ></Pagination>
                    </div>
                    <div className="h-5"></div>
                </>
            )}

            {curImgInfo.imgSrc !== "" ? (
                <ImageDetailPopup
                    show={showPop}
                    onClose={() => setShowPop(false)}
                    curImgInfo={curImgInfo}
                    newSearchNavi={newSearchNavi}
                    taskId={taskId}
                    genre={searchTarget.curPicGenre}
                    type={searchTarget.curEvtType}
                />
            ) : null}
        </div>
    );
}

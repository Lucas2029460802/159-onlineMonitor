import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import CategoryGroup from "./components/CategoryGroup";
import { FilterOptions } from "./components/Filter";
import OrderShowtimeGroup from "./components/OrderShowtimeGroup";
import PicGenreToggle from "./components/PicGenreToggle";
import { SearchGrid } from "./components/SearchCard/search-grid";
import { getGroupOptions, getSearchItems } from "./util/request";

import { SearchDataRes, SearchMediaGenre } from "@/api/type";
import { IconSearch } from "@/assets/svg";
import { Pagination } from "@/components/pagination";
import { useFetch } from "@/hooks/useFetch";
import type { TimeRange } from "@/pages/bigpic/components/grid";

const EventTypeValues = [
    "all",
    "person",
    "car",
    "bike",
    "other",
    "face",
] as const;

function isEventType(x: any): x is EventType {
    return EventTypeValues.includes(x);
}
function isMediaGenre(x: string | null): x is SearchMediaGenre {
    return x === "png" || x === "gif";
}

export type EventType = (typeof EventTypeValues)[number];
export interface FilterTarget {
    groupId: string;
    channelId: string;
    evtType: EventType;
    keywords: string;
    startTime: Date | null;
    endTime: Date | null;
    page: number;
    size: number;
    genre: SearchMediaGenre;
    sortOrder: number;
    sortFieldId: number;
}
export type ChangeFilter = <K extends keyof FilterTarget>(
    key: K,
    value: FilterTarget[K],
) => void;

const PERPAGE = 20;

export default function OnlineSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showTime, setShowTime] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        const start = searchParams.get("startTime");
        const end = searchParams.get("endTime");
        if (start && end) return [dayjs(start), dayjs(end)];
        return [undefined, undefined];
    });

    const [filterTarget, setFilterTarget] = useState<FilterTarget>(() => {
        const urlEvtType = searchParams.get("evtType");
        const urlGenre = searchParams.get("genre");
        const start = searchParams.get("startTime");
        const end = searchParams.get("endTime");
        return {
            groupId: searchParams.get("groupId") ?? "-1",
            channelId: searchParams.get("channelId") ?? "-1",
            keywords: searchParams.get("keywords") ?? "",
            evtType: isEventType(urlEvtType) ? urlEvtType : "all",
            startTime: start ? new Date(start) : null,
            endTime: end ? new Date(end) : null,
            page: Number(searchParams.get("page") ?? 0),
            size: PERPAGE,
            genre: isMediaGenre(urlGenre) ? urlGenre : "png",
            sortOrder: Number(searchParams.get("order") ?? 1),
            sortFieldId: Number(searchParams.get("sort_field_id") ?? 0),
        };
    });
    const [searchKeywords, setSearchKeywords] = useState(
        filterTarget.keywords,
    );
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const [start, end] = timeRange;
        const nextStart = start ? start.toDate() : null;
        const nextEnd = end ? end.toDate() : null;
        setFilterTarget((prev) => {
            const sameStart =
                (prev.startTime?.getTime() ?? null) ===
                (nextStart?.getTime() ?? null);
            const sameEnd =
                (prev.endTime?.getTime() ?? null) ===
                (nextEnd?.getTime() ?? null);
            if (sameStart && sameEnd) return prev;
            return {
                ...prev,
                startTime: nextStart,
                endTime: nextEnd,
                page: 0,
            };
        });
    }, [timeRange]);

    useEffect(() => {
        const params: Record<string, string> = {
            groupId: filterTarget.groupId,
            channelId: filterTarget.channelId,
            evtType: filterTarget.evtType,
            keywords: filterTarget.keywords,
            page: filterTarget.page.toString(),
            genre: filterTarget.genre,
            order: String(filterTarget.sortOrder),
            sort_field_id: String(filterTarget.sortFieldId),
        };
        if (filterTarget.startTime)
            params.startTime = filterTarget.startTime.toISOString();
        if (filterTarget.endTime)
            params.endTime = filterTarget.endTime.toISOString();
        setSearchParams(params);
    }, [filterTarget, setSearchParams]);

    const { data: groupOptions } = useFetch<FilterOptions>(
        false,
        getGroupOptions,
    );

    // 关键词检索需要有效分组；无指定通道时用第一个分组，否则保持 -1
    useEffect(() => {
        if (!groupOptions || groupOptions.length === 0) return;
        const first = String(groupOptions[0].value);
        setFilterTarget((prev) => {
            if (prev.channelId !== "-1") return prev;
            if (prev.keywords.trim() && (prev.groupId === "" || prev.groupId === "-1")) {
                return { ...prev, groupId: first };
            }
            return prev;
        });
    }, [groupOptions, filterTarget.keywords, filterTarget.channelId]);

    const onChange: ChangeFilter = (key, value) => {
        setFilterTarget((prev) => ({
            ...prev,
            [key]: value,
            page: 0,
        }));
    };

    const [timeStamp, setTimeStamp] = useState(0);
    const refresh = () => setTimeStamp((prev) => prev + 1);
    const { loading: searchResLoading, data: searchRes } =
        useFetch<SearchDataRes>(false, getSearchItems, filterTarget, timeStamp);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeStamp((prev) => prev + 1);
        }, 5000);
        return () => window.clearInterval(timer);
    }, []);

    const searchBtn = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const triggerSearch = (e: KeyboardEvent) => {
            if (e.key === "Enter") searchBtn.current?.click();
        };
        window.addEventListener("keydown", triggerSearch);
        return () => window.removeEventListener("keydown", triggerSearch);
    }, []);

    const total = searchRes?.Data?.total ?? 0;
    const genreCount = {
        png:
            filterTarget.genre === "png" && !searchResLoading ? total : null,
        gif:
            filterTarget.genre === "gif" && !searchResLoading ? total : null,
    };

    return (
        <div className="w-full min-h-full bg-gray-50 px-16 py-8 overflow-y-scroll">
            <div className="flex justify-center mb-6 h-12">
                <div className="relative w-full max-w-160 flex items-center border border-[#d1d5dc] rounded-xl shadow-sm overflow-hidden p-[5px]">
                    <div className="pl-4 pr-2 text-[#00AEEC]">
                        <IconSearch />
                    </div>
                    <input
                        type="text"
                        placeholder="输入搜索关键词..."
                        className="flex-grow py-3 px-2 focus:outline-none focus:ring-0"
                        value={searchKeywords}
                        onChange={(e) => setSearchKeywords(e.target.value)}
                    />
                    <button
                        className="bg-[rgb(0,174,236)] text-white px-5 w-25 h-full hover:bg-[rgb(64,197,241)] transition rounded-xl cursor-pointer"
                        ref={searchBtn}
                        onClick={() => {
                            setFilterTarget((prev) => ({
                                ...prev,
                                keywords: searchKeywords,
                                page: 0,
                            }));
                        }}
                    >
                        搜索
                    </button>
                </div>
            </div>

            <PicGenreToggle
                genre={filterTarget.genre}
                onChange={(genre) => {
                    setFilterTarget((prev) => ({
                        ...prev,
                        genre,
                        evtType: "all",
                        page: 0,
                    }));
                }}
                count={genreCount}
            />
            <div className="border-b border-solid border-gray-1 mb-5" />

            <div className="gap-4 mb-8">
                <CategoryGroup
                    evtType={filterTarget.evtType}
                    onChange={(type) => onChange("evtType", type)}
                />
                <OrderShowtimeGroup
                    showTime={showTime}
                    setShowTime={setShowTime}
                    sortOrder={filterTarget.sortOrder}
                    sortFieldID={filterTarget.sortFieldId}
                    onSortChange={(sortOrder, sortFieldId) => {
                        setFilterTarget((prev) => ({
                            ...prev,
                            sortOrder,
                            sortFieldId,
                            page: 0,
                        }));
                    }}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    videoId={Number(filterTarget.channelId)}
                    onVideoChange={(videoId) => {
                        setFilterTarget((prev) => ({
                            ...prev,
                            channelId: String(videoId),
                            groupId: videoId === -1 ? prev.groupId || "-1" : "-1",
                            page: 0,
                        }));
                    }}
                />
            </div>

            <div ref={gridRef}>
                <SearchGrid
                    loading={searchResLoading}
                    data={searchRes}
                    genre={filterTarget.genre}
                    showTime={showTime}
                    sortOrder={filterTarget.sortOrder}
                    sortFieldId={filterTarget.sortFieldId}
                    refresh={refresh}
                />
            </div>

            {searchRes && searchRes.Data.total !== 0 && (
                <div className="flex justify-center mt-[50px]">
                    <Pagination
                        total={Math.ceil(searchRes.Data.total / PERPAGE)}
                        defaultValue={1}
                        curPage={filterTarget.page + 1}
                        onChange={async (page) => {
                            const actualPage = page - 1;
                            if (actualPage === filterTarget.page) return;
                            gridRef.current?.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                            setFilterTarget((prev) => ({
                                ...prev,
                                page: actualPage,
                            }));
                        }}
                    />
                </div>
            )}
            <div className="h-5" />
        </div>
    );
}

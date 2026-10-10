import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import CategoryGroup from "./components/CategoryGroup";
import OrderShowtimeGroup from "./components/OrderShowtimeGroup";
import PicGenreToggle from "./components/PicGenreToggle";
import { SearchGrid } from "./components/SearchCard/search-grid";
import {
    getSearchItems,
    hasSelectedGroup,
    readStoredGroupId,
    storeGroupId,
} from "./util/request";

import { SearchDataRes, SearchMediaGenre } from "@/api/type";
import { IconSearch } from "@/assets/svg";
import { Pagination } from "@/components/pagination";
import type { TimeRange } from "@/pages/bigpic/components/grid";
import { Message } from "@/util/ui";

const EventTypeValues = [
    "all",
    "person",
    "car",
    "bike",
    "other",
    "face",
] as const;

function isEventType(x: string | null): x is EventType {
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
        const urlGroupId = searchParams.get("groupId") ?? "";
        return {
            groupId: hasSelectedGroup(urlGroupId)
                ? urlGroupId
                : readStoredGroupId(),
            channelId: "-1",
            keywords: "",
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
    const [searchKeywords, setSearchKeywords] = useState("");
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

    useEffect(() => {
        storeGroupId(filterTarget.groupId);
    }, [filterTarget.groupId]);

    const groupSelected = hasSelectedGroup(filterTarget.groupId);

    const onChange: ChangeFilter = (key, value) => {
        setFilterTarget((prev) => ({
            ...prev,
            [key]: value,
            page: 0,
        }));
    };

    const [searchResLoading, setSearchResLoading] = useState(false);
    const [searchRes, setSearchRes] = useState<SearchDataRes | null>(null);
    const filterRef = useRef(filterTarget);
    filterRef.current = filterTarget;
    const queryKey = [
        filterTarget.groupId,
        filterTarget.evtType,
        filterTarget.keywords,
        filterTarget.page,
        filterTarget.size,
        filterTarget.startTime?.getTime() ?? "",
        filterTarget.endTime?.getTime() ?? "",
    ].join("|");
    const loadedKeyRef = useRef("");

    useEffect(() => {
        const current = filterRef.current;
        if (!hasSelectedGroup(current.groupId)) {
            loadedKeyRef.current = "";
            setSearchRes(null);
            setSearchResLoading(false);
            return;
        }
        let cancelled = false;
        if (loadedKeyRef.current !== queryKey) setSearchRes(null);
        setSearchResLoading(true);
        getSearchItems(current)
            .then((res) => {
                if (cancelled) return;
                loadedKeyRef.current = queryKey;
                setSearchRes(res);
                setSearchResLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setSearchResLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [queryKey]);

    const searchBtn = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const triggerSearch = (e: KeyboardEvent) => {
            if (e.key === "Enter") searchBtn.current?.click();
        };
        window.addEventListener("keydown", triggerSearch);
        return () => window.removeEventListener("keydown", triggerSearch);
    }, []);

    const total = groupSelected ? (searchRes?.Data?.total ?? 0) : 0;
    const genreCount = {
        png:
            groupSelected && filterTarget.genre === "png" && !searchResLoading
                ? total
                : null,
        gif:
            groupSelected && filterTarget.genre === "gif" && !searchResLoading
                ? total
                : null,
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
                            if (!hasSelectedGroup(filterTarget.groupId)) {
                                Message.warning("", "请先选择分组");
                                return;
                            }
                            setFilterTarget((prev) => ({
                                ...prev,
                                keywords: searchKeywords.trim(),
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
                    groupId={filterTarget.groupId}
                    onGroupChange={(groupId) => {
                        setFilterTarget((prev) => ({
                            ...prev,
                            groupId,
                            channelId: "-1",
                            page: 0,
                        }));
                    }}
                />
            </div>

            <div ref={gridRef}>
                <SearchGrid
                    idle={!groupSelected}
                    loading={groupSelected && searchResLoading}
                    data={groupSelected ? searchRes : null}
                    genre={filterTarget.genre}
                    showTime={showTime}
                    sortOrder={filterTarget.sortOrder}
                    sortFieldId={filterTarget.sortFieldId}
                />
            </div>

            {groupSelected && searchRes && searchRes.Data.total !== 0 && (
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

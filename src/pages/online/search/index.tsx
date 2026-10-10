import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Fitler, { ChannelRes, FilterOptions } from "./components/Filter";
import PicGenreToggle from "./components/PicGenreToggle";
import { SearchGrid } from "./components/SearchCard/search-grid";
import TimeAreaFilter from "./components/TimeArea";
import {
    getSearchItems,
    getChannelOptions,
    getGroupOptions,
} from "./util/request";

import { SearchDataRes, SearchMediaGenre } from "@/api/type";
import { IconSearch } from "@/assets/svg";
import { Pagination } from "@/components/pagination";
import { useFetch } from "@/hooks/useFetch";
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
}
export type ChangeFilter = <K extends keyof FilterTarget>(
    key: K,
    value: FilterTarget[K],
) => void;

const PERPAGE = 20;
export default function OnlineSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filterTarget, setFilterTarget] = useState<FilterTarget>(() => {
        const urlEvtType = searchParams.get("evtType");
        const urlGenre = searchParams.get("genre");
        return {
            groupId: searchParams.get("groupId") ?? "",
            channelId: searchParams.get("channelId") ?? "-1",
            keywords: searchParams.get("keywords") ?? "",
            evtType: isEventType(urlEvtType) ? urlEvtType : "all",
            startTime: searchParams.get("startTime")
                ? new Date(searchParams.get("startTime")!)
                : null,
            endTime: searchParams.get("endTime")
                ? new Date(searchParams.get("endTime")!)
                : null,
            page: Number(searchParams.get("page") ?? 0),
            size: PERPAGE,
            genre: isMediaGenre(urlGenre) ? urlGenre : "gif",
        };
    });

    useEffect(() => {
        const params: Record<string, string> = {
            groupId: filterTarget.groupId,
            channelId: filterTarget.channelId,
            evtType: filterTarget.evtType,
            keywords: filterTarget.keywords,
            page: filterTarget.page.toString(),
            genre: filterTarget.genre,
        };

        if (filterTarget.startTime)
            params.startTime = filterTarget.startTime.toISOString();
        if (filterTarget.endTime)
            params.endTime = filterTarget.endTime.toISOString();

        setSearchParams(params);
    }, [filterTarget, setSearchParams]);

    const { loading: groupLoading, data: groupOptions } =
        useFetch<FilterOptions>(false, getGroupOptions);

    useEffect(() => {
        setFilterTarget((prev) => ({
            ...prev,
            groupId:
                groupOptions && groupOptions.length > 0
                    ? String(groupOptions[0].value)
                    : prev.groupId,
        }));
    }, [groupOptions]);

    const { loading: channelLoading, data: channelRes } = useFetch<ChannelRes>(
        false,
        getChannelOptions,
        filterTarget.groupId,
        -1, // 可以直接拿到所有数据
    );

    // 固定的
    const evtTypeOptions = [
        { value: "all", label: "全部" },
        { value: "person", label: "人" },
        { value: "car", label: "机动车" },
        { value: "bike", label: "非机动车" },
        // { value: "face", label: "人脸" },
        { value: "other", label: "其它" },
    ];

    const onChange: ChangeFilter = (key, value) => {
        console.log(key, value);
        setFilterTarget((prev) => {
            const updated = {
                ...prev,
                [key]: value,
                page: 0,
            };
            if (key === "groupId") {
                updated.channelId = "-1";
            }
            return updated;
        });
    };
    const j = useRef<Date | null>(null);

    const onChangeTime = (a: Date | null, b: Date | null) => {
        setFilterTarget((prev) => {
            console.log("set time了", j.current, j.current === a, a);
            j.current = a;
            return {
                ...prev,
                startTime: a,
                endTime: b,
            };
        });
    };

    const [timeStamp, setTimeStamp] = useState(0); // 用来刷新请求alertRes的timeStamp
    const refresh = () => {
        setTimeStamp((prev) => prev + 1);
    };
    const { loading: searchResLoading, data: searchRes } =
        useFetch<SearchDataRes>(false, getSearchItems, filterTarget, timeStamp);

    // 每 5 秒自动刷新实时监测列表
    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeStamp((prev) => prev + 1);
        }, 5000);
        return () => window.clearInterval(timer);
    }, []);

    const inputVal = useRef("");
    const searchBtn = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const triggerSearch = (e: KeyboardEvent) => {
            if (e.key === "Enter") searchBtn.current?.click();
        };
        window.addEventListener("keydown", triggerSearch);
        return () => {
            window.removeEventListener("keydown", triggerSearch);
        };
    }, []);

    return (
        <div className="w-full h-full px-6 py-4 overflow-y-scroll">
            <div className="mb-4 rounded-2xl border border-[#eef1f4] bg-white/90 px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-xl flex items-center border border-[#e5e7eb] rounded-xl overflow-hidden h-10 bg-white">
                        <div className="pl-3 pr-1 text-[#00AEEC]">
                            <IconSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="输入搜索关键词..."
                            className="flex-grow h-full px-2 text-sm focus:outline-none focus:ring-0"
                            onChange={(e) => {
                                inputVal.current = e.target.value;
                            }}
                            defaultValue={filterTarget.keywords}
                        />
                        <button
                            className="bg-[rgb(0,174,236)] text-white px-4 h-full text-sm hover:bg-[rgb(64,197,241)] transition cursor-pointer"
                            ref={searchBtn}
                            onClick={() => {
                                setFilterTarget((prev) => ({
                                    ...prev,
                                    keywords: inputVal.current,
                                    page: 0,
                                }));
                            }}
                        >
                            搜索
                        </button>
                    </div>
                    <Fitler
                        loading={groupLoading}
                        options={groupOptions}
                        value={groupOptions ? filterTarget.groupId : ""}
                        field={"groupId"}
                        typeName="组别"
                        selectClassName="w-36"
                        onChange={onChange}
                    ></Fitler>
                    <Fitler
                        options={channelRes}
                        loading={channelLoading}
                        value={channelRes ? filterTarget.channelId : ""}
                        field={"channelId"}
                        typeName="视频流"
                        selectClassName="w-36"
                        typeClassName="w-16"
                        onChange={onChange}
                    ></Fitler>
                    <Fitler
                        options={evtTypeOptions}
                        field="evtType"
                        value={filterTarget.evtType}
                        typeName="类型"
                        selectClassName="w-28"
                        onChange={onChange}
                    ></Fitler>
                    <TimeAreaFilter
                        typeName="时间段"
                        typeClassName="w-16"
                        startTime={filterTarget.startTime}
                        endTime={filterTarget.endTime}
                        onChange={onChangeTime}
                    ></TimeAreaFilter>
                    <PicGenreToggle
                        genre={filterTarget.genre}
                        onChange={(genre) => {
                            setFilterTarget((prev) => ({
                                ...prev,
                                genre,
                                page: 0,
                            }));
                        }}
                    />
                </div>
            </div>
            <SearchGrid
                loading={searchResLoading}
                data={searchRes}
                genre={filterTarget.genre}
                refresh={refresh}
            ></SearchGrid>

            {searchRes && searchRes.Data.total !== 0 && (
                <div className="pt-8 w-full flex items-center justify-center">
                    <Pagination
                        total={Math.ceil(searchRes.Data.total / PERPAGE)}
                        defaultValue={1}
                        curPage={filterTarget.page + 1}
                        onChange={async (page) => {
                            const actualPage = page - 1;
                            if (actualPage === filterTarget.page) return;
                            setFilterTarget((prev) => ({
                                ...prev,
                                page: actualPage,
                            }));
                        }}
                    />
                </div>
            )}
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { strategyMap, svStrategyId } from "../types";
import { AlertGrid } from "./components/AlertCard/alert-grid";
import Fitler, { ChannelRes, FilterOptions } from "./components/Filter";
import TimeAreaFilter from "./components/TimeArea";
import {
    getAlertItems,
    getChannelOptions,
    getGroupOptions,
} from "./util/request";

import { AlertDataRes } from "@/api/type";
import { Pagination } from "@/components/pagination";
import { useFetch } from "@/hooks/useFetch";
export interface FilterTarget {
    groupId: string;
    channelId: string;
    strategyId: svStrategyId | "-1";
    dealt: string;
    startTime: Date | null;
    endTime: Date | null;
    page: number;
    size: number;
}
export type ChangeFilter = <K extends keyof FilterTarget>(
    key: K,
    value: FilterTarget[K],
) => void;

const PERPAGE = 20;
export default function AlertCenter() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [filterTarget, setFilterTarget] = useState<FilterTarget>({
        groupId: searchParams.get("groupId") ?? "-1",
        channelId: searchParams.get("channelId") ?? "-1",
        strategyId: (searchParams.get("strategyId") ?? "-1") as
            | svStrategyId
            | "-1",
        dealt: searchParams.get("dealt") ?? "-1",
        startTime: searchParams.get("startTime")
            ? new Date(searchParams.get("startTime")!)
            : null,
        endTime: searchParams.get("endTime")
            ? new Date(searchParams.get("endTime")!)
            : null,
        page: Number(searchParams.get("page") ?? 0),
        size: PERPAGE,
    });

    useEffect(() => {
        const params: Record<string, string> = {
            groupId: filterTarget.groupId,
            channelId: filterTarget.channelId,
            strategyId: filterTarget.strategyId.toString(),
            dealt: filterTarget.dealt,
            page: filterTarget.page.toString(),
        };

        if (filterTarget.startTime)
            params.startTime = filterTarget.startTime.toISOString();
        if (filterTarget.endTime)
            params.endTime = filterTarget.endTime.toISOString();

        setSearchParams(params);
    }, [filterTarget, setSearchParams]);

    const { loading: groupLoading, data: groupOptions } =
        useFetch<FilterOptions>(false, getGroupOptions);

    const { loading: channelLoading, data: channelRes } = useFetch<ChannelRes>(
        false,
        getChannelOptions,
        filterTarget.groupId,
        -1, // 可以直接拿到所有数据
    );

    // 固定的,pop排除人流检测
    const algorithmOptions = [
        { value: "-1", label: "全部算法" },
        ...Object.entries(strategyMap).map((item) => ({
            value: item[0],
            label: item[1],
        })),
    ];
    algorithmOptions.pop();

    // 固定的
    const dealtOptions = [
        { value: "-1", label: "全部" },
        { value: "0", label: "未处理" },
        { value: "1", label: "已处理" },
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
            console.log("set了", j.current, j.current === a, a);
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
    const { loading: alertResLoading, data: alertRes } = useFetch<AlertDataRes>(
        false,
        getAlertItems,
        filterTarget,
        timeStamp,
    );

    return (
        <div className="w-full h-full px-15 py-5 overflow-y-scroll">
            <div className="grid gap-y-5 mb-5">
                <div className="flex gap-5">
                    <Fitler
                        loading={groupLoading}
                        options={groupOptions}
                        value={groupOptions ? filterTarget.groupId : ""}
                        field={"groupId"}
                        typeName="组别"
                        selectClassName="w-40"
                        onChange={onChange}
                    ></Fitler>
                    <Fitler
                        options={channelRes}
                        loading={channelLoading}
                        value={channelRes ? filterTarget.channelId : ""}
                        field={"channelId"}
                        typeName="视频流"
                        selectClassName="w-40"
                        typeClassName="w-20"
                        onChange={onChange}
                    ></Fitler>
                    <Fitler
                        options={algorithmOptions}
                        value={filterTarget.strategyId}
                        field="strategyId"
                        typeName="算法"
                        selectClassName="w-30"
                        typeClassName="w-20"
                        onChange={onChange}
                    ></Fitler>
                </div>
                <div className="flex gap-5">
                    <Fitler
                        options={dealtOptions}
                        field="dealt"
                        value={filterTarget.dealt}
                        typeName="状态"
                        selectClassName="w-40"
                        onChange={onChange}
                    ></Fitler>
                    <TimeAreaFilter
                        typeName="时间段"
                        typeClassName="w-20"
                        startTime={filterTarget.startTime}
                        endTime={filterTarget.endTime}
                        onChange={onChangeTime}
                    ></TimeAreaFilter>
                </div>
            </div>
            <AlertGrid
                loading={alertResLoading}
                data={alertRes}
                refresh={refresh}
            ></AlertGrid>

            {alertRes && alertRes.Data.total !== 0 && (
                <div className="pt-8 w-full flex items-center justify-center">
                    <Pagination
                        total={Math.ceil(alertRes.Data.total / PERPAGE)}
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

import { al } from "node_modules/react-router/dist/development/fog-of-war-Cm1iXIp7";
import { useState } from "react";

import AlertCard from ".";
import AlertPopup from "./alertPopup";
import IconEmpty from "../../svg/icon-empty.svg?react";

import { api } from "@/api";
import { AlertDataRes, AlertOne } from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { strategyMap, svStrategyId } from "@/pages/online/types";
import { Message } from "@/util/ui";

interface AlertGridProps {
    loading: boolean;
    data: AlertDataRes | null;
    refresh: () => void;
}
export function AlertGrid({ loading, data, refresh }: AlertGridProps) {
    const [curImageInfo, setCurImageInfo] = useState<AlertOne | null>(null);
    const [show, setShow] = useState(false);
    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center ">
                <div className="flex items-center gap-6 text-2xl relative -top-15">
                    <IconLoading />
                    <div>预警信息加载中</div>
                </div>
            </div>
        );
    }
    console.log("data", data);
    if (!data || data.Data.list.length === 0)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="flex items-center gap-6 text-2xl relative -top-15 flex-col">
                    <IconEmpty />
                    <div className="text-[#9c9898]">暂无数据</div>
                </div>
            </div>
        );

    return (
        <div className="grid grid-cols-4 2xl:grid-cols-5 gap-5">
            {data.Data.list.map((item) => (
                <AlertCard
                    key={item.id}
                    time={item.time}
                    location={item.location}
                    url={item.url}
                    strategy={
                        strategyMap[item.strategy_id as svStrategyId] ??
                        "未知名字的策略"
                    }
                    onClick={() => {
                        setShow(true);
                        setCurImageInfo(item);
                        return undefined;
                    }}
                    dealt={item.status === 1}
                />
            ))}
            {curImageInfo !== null ? (
                <AlertPopup
                    show={show}
                    onClose={() => {
                        setShow(false);
                    }}
                    curImgInfo={curImageInfo}
                    handleConfirm={async (alertId: number) => {
                        await api.online.confirmAlert(alertId);
                        Message.success("", "已标记该预警为已处理");
                        refresh();
                        setShow(false);
                    }}
                    handleIgnore={async (alertId: number) => {
                        await api.online.ignoreAlert(alertId);
                        Message.success("", "已忽略该预警");
                        refresh();
                        setShow(false);
                    }}
                />
            ) : null}
        </div>
    );
}

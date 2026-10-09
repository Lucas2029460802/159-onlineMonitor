import { FilterTarget } from "..";
import { AlertCardProps } from "../components/AlertCard";
import { ChannelRes, FilterOptions } from "../components/Filter";

import { api } from "@/api";
import { AlertDataRes } from "@/api/type";

export type AlertResponse = {
    total: number;
    data: AlertCardProps[];
};
export async function getGroupOptions(): Promise<FilterOptions> {
    const res = await api.online.getAllGroups();
    const groupOptions = res.Data.map((g) => ({
        value: g.Id.toString(), // 统统转为字符串
        label: g.Name,
    }));
    return [{ value: "-1", label: "全部组别" }, ...groupOptions];
}

export async function getChannelOptions(
    groupId: string,
    num: number,
): Promise<ChannelRes> {
    if (groupId === "-1") {
        return [{ value: "-1", label: "全部监控" }];
    }
    const res = await api.online.getCertainGroups(groupId, 0, num);
    const channelOptions = res.Data.map((c) => ({
        value: c.Id.toString(),
        label: c.name,
    }));

    // 最后增加全部选项

    return [{ value: "-1", label: "全部监控" }, ...channelOptions];
}

export async function getAlertItems(
    t: FilterTarget,
    timeStamp: number,
): Promise<AlertDataRes> {
    const {
        groupId,
        channelId,
        strategyId,
        dealt,
        startTime,
        endTime,
        page,
        size,
    } = t;
    console.log(
        `(1)请求AlertCard数据时的参数 groupId: ${groupId}, video_id: ${channelId}, strategyId: ${strategyId}, dealt: ${dealt}`,
    );
    console.log(
        `(2)请求AlertCard数据时的参数 startTime: ${startTime}, endTime: ${endTime}, page: ${page}, size: ${size}`,
    );

    const res = await api.online.getAlertData({
        group_id: groupId,
        video_id: channelId,
        strategy_id: strategyId === "-1" ? -1 : strategyId,
        start_time: startTime,
        end_time: endTime,
        index: page,
        size,
        status: dealt === "all" ? "-1" : dealt,
    });
    return res;
}

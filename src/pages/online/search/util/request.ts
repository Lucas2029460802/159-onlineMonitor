import { FilterTarget } from "..";
import { ChannelRes, FilterOptions } from "../components/Filter";
import { SearchCardProps } from "../components/SearchCard";

import { api } from "@/api";
import { SearchDataRes } from "@/api/type";

export type AlertResponse = {
    total: number;
    data: SearchCardProps[];
};
export async function getGroupOptions(): Promise<FilterOptions> {
    const res = await api.online.getAllGroups();
    if (res.Data.length === 0) {
        return [{ value: "", label: "没有组别" }];
    }
    const groupOptions = res.Data.map((g) => ({
        value: g.Id.toString(), // 统统转为字符串
        label: g.Name,
    }));

    // return [{ value: "-1", label: "全部组别" }, ...groupOptions];
    return groupOptions;
}

export async function getChannelOptions(
    groupId: string,
    num: number,
): Promise<ChannelRes> {
    if (groupId === "-1" || groupId === "") {
        return [{ value: "-1", label: "全部监控" }];
    }
    const res = await api.online.getCertainGroups(groupId, 0, num);
    const channelOptions = res.Data.map((c) => ({
        value: c.Id.toString(),
        label: c.name,
    }));

    return [{ value: "-1", label: "全部监控" }, ...channelOptions];
}

export async function getSearchItems(
    t: FilterTarget,
    timeStamp: number,
): Promise<SearchDataRes> {
    const {
        groupId,
        channelId,
        evtType,
        startTime,
        endTime,
        page,
        size,
        keywords,
    } = t;
    console.log(
        `(1)请求SearchCard数据时的参数 groupId: ${groupId}, video_id: ${channelId}, evtType: ${evtType},keywords : ${keywords}`,
    );
    console.log(
        `(2)请求SearchCard数据时的参数 startTime: ${startTime}, endTime: ${endTime}, page: ${page}, size: ${size}`,
    );

    // return {
    //     Message: "",
    //     Data: {
    //         total: 1,
    //         list: [
    //             {
    //                 id: 1,
    //                 time: new Date(),
    //                 url: "34020000001110000002340200000013100000021764574224.33771681_0.webp",
    //                 location: "杨浦大道",
    //                 hitString: "一个可疑的人",
    //                 type: "person" as unknown as EvtType,
    //             },
    //         ],
    //     },
    // };

    const res = await api.online.getSearchData({
        group_id: groupId,
        video_id: channelId,
        evtType: evtType,
        keywords,
        start_time: startTime,
        end_time: endTime,
        index: page,
        size,
    });
    return res;
}

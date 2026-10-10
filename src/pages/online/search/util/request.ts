import { FilterTarget } from "..";
import { ChannelRes, FilterOptions } from "../components/Filter";

import { api } from "@/api";
import { SearchDataRes } from "@/api/type";

export async function getGroupOptions(): Promise<FilterOptions> {
    const res = await api.online.getAllGroups();
    if (res.Data.length === 0) {
        return [{ value: "", label: "没有组别" }];
    }
    const groupOptions = res.Data.map((g) => ({
        value: g.Id.toString(),
        label: g.Name,
    }));

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

function normalizeSearchItem(raw: any) {
    const hitString =
        raw.hitString ?? raw.hit_string ?? raw.HitString ?? raw.hit ?? "";
    const tag = Array.isArray(raw.tag)
        ? raw.tag
        : Array.isArray(raw.Tag)
          ? raw.Tag
          : undefined;
    const instances = Array.isArray(raw.instances)
        ? raw.instances
        : Array.isArray(raw.Instances)
          ? raw.Instances
          : undefined;

    return {
        ...raw,
        id: raw.id ?? raw.Id,
        time: raw.time ? new Date(raw.time) : new Date(),
        url: raw.url ?? "",
        location: raw.location ?? "",
        hitString,
        type: raw.type,
        event_type: raw.event_type ?? raw.eventType,
        event_id: raw.event_id ?? raw.eventId,
        segment_id: raw.segment_id ?? raw.segmentId,
        folderId: raw.folderId ?? raw.folder_id,
        caption: raw.caption ?? raw.Caption ?? "",
        tag,
        start: raw.start ?? raw.Start,
        end: raw.end ?? raw.End,
        instances,
        metadata_url: raw.metadata_url ?? raw.metadataUrl,
    };
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
    void timeStamp;

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

    return {
        ...res,
        Data: {
            ...res.Data,
            list: (res.Data?.list ?? []).map(normalizeSearchItem),
        },
    };
}

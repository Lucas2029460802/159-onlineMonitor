import { FilterTarget } from "..";
import { onlineEventMediaKey } from "./media";
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

function firstText(...values: unknown[]): string {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) return value;
    }
    return "";
}

function mediaPaths(value: unknown): string[] | undefined {
    let items: unknown = value;
    if (typeof items === "string") {
        const text = items.trim();
        if (!text) return undefined;
        if (text.startsWith("[")) {
            try {
                items = JSON.parse(text);
            } catch {
                const key = onlineEventMediaKey(text);
                return key ? [key] : undefined;
            }
        } else {
            const key = onlineEventMediaKey(text);
            return key ? [key] : undefined;
        }
    }
    if (!Array.isArray(items)) return undefined;
    const paths = items
        .map((item) => {
            if (typeof item === "string") return onlineEventMediaKey(item);
            if (item && typeof item === "object") {
                const record = item as Record<string, unknown>;
                return onlineEventMediaKey(
                    firstText(
                        record.path,
                        record.url,
                        record.image_path,
                        record.ScreenShot,
                    ),
                );
            }
            return "";
        })
        .filter(Boolean);
    return paths.length > 0 ? paths : undefined;
}

// 检索记录字段名不固定，按实际响应兼容读取
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSearchItem(raw: any) {
    const hitString =
        raw.hitString ?? raw.hit_string ?? raw.HitString ?? raw.hit ?? "";
    const tag = Array.isArray(raw.tag)
        ? raw.tag
        : Array.isArray(raw.Tag)
          ? raw.Tag
          : undefined;
    const instances = mediaPaths(
        raw.instances ?? raw.Instances ?? raw.instance,
    );
    const url = onlineEventMediaKey(
        firstText(raw.url, raw.Url, raw.Gif, raw.gif, raw.gif_url, raw.gifUrl),
    );

    return {
        ...raw,
        id: raw.id ?? raw.Id,
        time: raw.time ? new Date(raw.time) : new Date(),
        url,
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

const GROUP_STORAGE_KEY = "online-search-group-id";

export function hasSelectedGroup(groupId: string) {
    const id = Number(groupId);
    return Number.isFinite(id) && id > 0;
}

export function readStoredGroupId(): string {
    try {
        const id = localStorage.getItem(GROUP_STORAGE_KEY) ?? "";
        return hasSelectedGroup(id) ? id : "";
    } catch {
        return "";
    }
}

export function storeGroupId(groupId: string) {
    try {
        if (hasSelectedGroup(groupId)) {
            localStorage.setItem(GROUP_STORAGE_KEY, groupId);
            return;
        }
        localStorage.removeItem(GROUP_STORAGE_KEY);
    } catch {
        // 隐私模式等无法写本地存储时，仍允许当次选择
    }
}

export async function getSearchItems(t: FilterTarget): Promise<SearchDataRes> {
    const { groupId, evtType, startTime, endTime, page, size, keywords } = t;

    if (!hasSelectedGroup(groupId)) {
        return { Message: "", Data: { list: [], total: 0 } };
    }

    const res = await api.online.getSearchData({
        group_id: groupId,
        video_id: -1,
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

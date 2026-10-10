import axios from "axios";

import {
    ChannelLifecycleResult,
    ChannelLifecycleState,
    ChannelRuntimeStatus,
    GroupLifecycleResult,
    GroupSettingState,
} from "@/api/type";
import { SurveillanceCameraInfo } from "@/pages/online/types";

const RUNTIME_STATUS: ChannelRuntimeStatus[] = [
    "pausing",
    "paused",
    "started",
    "running",
    "stopped",
    "stream_release_pending",
    "unknown",
];

export function isRuntimeStatus(value: unknown): value is ChannelRuntimeStatus {
    return RUNTIME_STATUS.includes(value as ChannelRuntimeStatus);
}

export function isChannelState(value: unknown): value is ChannelLifecycleState {
    return value === "running" || value === "paused";
}

export function normalizeChannelResult(
    raw: unknown,
): ChannelLifecycleResult | null {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const id = Number(item.id ?? item.Id);
    if (!Number.isFinite(id)) return null;
    const errorText =
        typeof item.error === "string"
            ? item.error
            : typeof item.Message === "string"
              ? item.Message
              : "";
    return {
        id,
        state: isChannelState(item.state) ? item.state : undefined,
        status: isRuntimeStatus(item.status) ? item.status : undefined,
        error: errorText || undefined,
    };
}

export function normalizeGroupLifecycle(raw: unknown): {
    groupId?: number;
    items: ChannelLifecycleResult[];
} {
    if (!raw || typeof raw !== "object") return { items: [] };
    const data = raw as GroupLifecycleResult;
    const channels = Array.isArray(data.channels) ? data.channels : [];
    const failed = Array.isArray(data.failed) ? data.failed : [];
    const byId = new Map<number, ChannelLifecycleResult>();
    for (const rawItem of [...channels, ...failed]) {
        const item = normalizeChannelResult(rawItem);
        if (!item) continue;
        const prev = byId.get(item.id);
        if (!prev) {
            byId.set(item.id, item);
            continue;
        }
        byId.set(item.id, {
            id: item.id,
            state: item.state ?? prev.state,
            status: item.status ?? prev.status,
            error: item.error ?? prev.error,
        });
    }
    const groupId = Number(data.group_id);
    return {
        groupId: Number.isFinite(groupId) ? groupId : undefined,
        items: [...byId.values()],
    };
}

export function needsLifecyclePoll(status?: ChannelRuntimeStatus) {
    return status === "pausing" || status === "stream_release_pending";
}

export function applyChannelLifecycle(
    list: SurveillanceCameraInfo[],
    result: ChannelLifecycleResult,
): SurveillanceCameraInfo[] {
    return list.map((item) => {
        if (item.svId !== String(result.id)) return item;
        return {
            ...item,
            channelState: result.state ?? item.channelState,
            lifecycleStatus: result.status ?? item.lifecycleStatus,
        };
    });
}

export function readGroupLifecycleError(
    err: unknown,
): ChannelLifecycleResult[] {
    if (!axios.isAxiosError(err)) return [];
    const body = err.response?.data;
    if (!body || typeof body !== "object") return [];
    return normalizeGroupLifecycle((body as { Data?: unknown }).Data).items;
}

export function readLifecyclePayload(err: unknown): {
    message: string;
    data: ChannelLifecycleResult | null;
} {
    if (!axios.isAxiosError(err)) return { message: "", data: null };
    const body = err.response?.data;
    if (!body || typeof body !== "object") return { message: "", data: null };
    const record = body as Record<string, unknown>;
    const message =
        typeof record.Message === "string"
            ? record.Message
            : typeof record.message === "string"
              ? record.message
              : "";
    return { message, data: normalizeChannelResult(record.Data) };
}

type BadgeTone = "ok" | "warn" | "muted" | "danger";

export function lifecycleBadge(
    channelState: ChannelLifecycleState,
    status?: ChannelRuntimeStatus,
): { text: string; tone: BadgeTone; title: string } {
    if (status === "paused") {
        return {
            text: "已暂停",
            tone: "muted",
            title: "进程已停止，布控流会话已释放",
        };
    }
    if (status === "pausing") {
        return {
            text: "暂停收尾中",
            tone: "warn",
            title: "已停止接收新工作，当前片段处理完成后才会变为已暂停",
        };
    }
    if (status === "stream_release_pending") {
        return {
            text: "流释放待重试",
            tone: "warn",
            title: "布控流释放或地址清空仍在重试",
        };
    }
    if (status === "unknown") {
        return {
            text: "无法确认",
            tone: "danger",
            title: "暂时无法确认进程状态",
        };
    }
    if (status === "started") {
        return {
            text: "启动中",
            tone: "warn",
            title: "Worker 已接受启动，模型加载和视频流健康仍需另行确认",
        };
    }
    if (status === "running") {
        return {
            text: "运行中",
            tone: "ok",
            title: "Worker 进程存在，摄像头是否有画面需另行确认",
        };
    }
    if (status === "stopped") {
        return {
            text: "进程未运行",
            tone: "danger",
            title: "Worker 不存在，数据库设置仍为运行",
        };
    }
    if (channelState === "paused") {
        return {
            text: "暂停未确认",
            tone: "warn",
            title: "数据库已设为暂停，尚未确认进程停止",
        };
    }
    return {
        text: "运行",
        tone: "ok",
        title: "数据库设置为运行，进程和摄像头健康需另行确认",
    };
}

const GROUP_SETTING_TEXT: Record<GroupSettingState, string> = {
    running: "全部为运行设置",
    paused: "全部为暂停设置",
    mixed: "部分通道为暂停设置",
    empty: "组内没有通道",
};

export function groupSettingText(state?: GroupSettingState) {
    if (!state) return "";
    return GROUP_SETTING_TEXT[state];
}

export function channelActionMessage(
    action: "暂停" | "恢复",
    result: ChannelLifecycleResult | null,
    serverMessage: string,
) {
    const status = result?.status;
    const state = result?.state ?? "running";
    let detail = `已提交${action}`;
    if (action === "暂停" && status === "pausing") {
        detail = "已停止接收新工作，正在等待当前片段收尾";
    } else if (status === "paused") {
        detail = "该通道已暂停";
    } else if (status === "started") {
        detail = "Worker 已接受启动";
    } else if (status) {
        detail = `当前状态：${lifecycleBadge(state, status).text}`;
    }
    return [serverMessage, detail].filter(Boolean).join("。");
}

export function groupActionMessage(
    action: "暂停" | "恢复",
    items: ChannelLifecycleResult[],
    serverMessage: string,
) {
    const failed = items.filter((item) => item.error);
    const accepted = items.length - failed.length;
    const parts = [
        serverMessage,
        `已提交${action}：${accepted} 路已接受，${failed.length} 路失败`,
    ];
    if (action === "暂停" && items.some((item) => item.status === "pausing")) {
        parts.push("收尾中的通道会继续查询，确认停止后显示「已暂停」");
    }
    const errors = failed
        .map((item) => item.error)
        .filter((item): item is string => Boolean(item))
        .slice(0, 3);
    if (errors.length > 0) parts.push(errors.join("；"));
    return parts.filter(Boolean).join("。");
}

import {
    CaptionEmbeddingStatus,
    CaptionListParams,
    CaptionListSortBy,
    CaptionObjectType,
    CaptionSearchParams,
    CaptionSearchSortBy,
    CaptionSortOrder,
    CaptionSourceDetailCode,
    CaptionStatus,
} from "@/api/caption-types";
import { date2ChineseString } from "@/util/time";

export interface CaptionQueryState {
    query: string;
    page: number;
    size: number;
    sort_by: CaptionSearchSortBy;
    sort_order: CaptionSortOrder;
    device_id: string;
    plate_no: string;
    capture_time_from: string;
    capture_time_to: string;
    object_type: CaptionObjectType | "";
    caption_status: CaptionStatus | "";
    embedding_status: CaptionEmbeddingStatus | "";
    object_id: string;
    image_id: string;
    has_caption: boolean | undefined;
    source_detail_code: CaptionSourceDetailCode | "";
    colors: string[];
    patterns: string[];
    categories: string[];
}

export interface CaptionFilterDraft {
    device_id: string;
    plate_no: string;
    capture_time_from: string;
    capture_time_to: string;
    object_type: CaptionObjectType | "";
    caption_status: CaptionStatus | "";
    embedding_status: CaptionEmbeddingStatus | "";
    object_id: string;
    image_id: string;
    has_caption: "" | "true" | "false";
    source_detail_code: CaptionSourceDetailCode | "";
    colors: string[];
    patterns: string[];
    categories: string[];
}

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

const ARRAY_KEYS = ["colors", "patterns", "categories"] as const;
const LIST_SORT_VALUES: CaptionListSortBy[] = [
    "capture_time",
    "ingested_at",
    "updated_at",
    "device_id",
    "plate_no",
    "object_type",
    "caption_status",
    "embedding_status",
];
const SEARCH_SORT_VALUES: CaptionSearchSortBy[] = [
    "relevance",
    ...LIST_SORT_VALUES,
];
const OBJECT_VALUES: CaptionObjectType[] = [
    "person",
    "face",
    "motor_vehicle",
    "non_motor_vehicle",
];
const CAPTION_STATUS_VALUES: CaptionStatus[] = [
    "pending",
    "processing",
    "completed",
    "failed",
];
const EMBEDDING_STATUS_VALUES: CaptionEmbeddingStatus[] = [
    "blocked",
    "pending",
    "processing",
    "completed",
    "failed",
];
const SOURCE_DETAIL_VALUES: CaptionSourceDetailCode[] = [
    "11",
    "12",
    "13",
    "14",
];

export const PAGE_SIZE_OPTIONS: Option<number>[] = [
    { value: 20, label: "20 / 页" },
    { value: 50, label: "50 / 页" },
    { value: 100, label: "100 / 页" },
];

export const SORT_ORDER_OPTIONS: Option<CaptionSortOrder>[] = [
    { value: "desc", label: "降序" },
    { value: "asc", label: "升序" },
];

export const OBJECT_TYPE_OPTIONS: Option<CaptionObjectType | "">[] = [
    { value: "", label: "全部目标" },
    { value: "person", label: "人体" },
    { value: "face", label: "人脸" },
    { value: "motor_vehicle", label: "机动车" },
    { value: "non_motor_vehicle", label: "非机动车" },
];

export const CAPTION_STATUS_OPTIONS: Option<CaptionStatus | "">[] = [
    { value: "", label: "全部 Caption 状态" },
    { value: "pending", label: "待处理" },
    { value: "processing", label: "处理中" },
    { value: "completed", label: "已完成" },
    { value: "failed", label: "失败" },
];

export const EMBEDDING_STATUS_OPTIONS: Option<CaptionEmbeddingStatus | "">[] = [
    { value: "", label: "全部 Embedding 状态" },
    { value: "blocked", label: "已阻断" },
    { value: "pending", label: "待处理" },
    { value: "processing", label: "处理中" },
    { value: "completed", label: "已完成" },
    { value: "failed", label: "失败" },
];

export const SOURCE_DETAIL_OPTIONS: Option<CaptionSourceDetailCode | "">[] = [
    { value: "", label: "全部细类" },
    { value: "11", label: "11 / person" },
    { value: "12", label: "12 / face" },
    { value: "13", label: "13 / motor_vehicle" },
    { value: "14", label: "14 / non_motor_vehicle" },
];

export const HAS_CAPTION_OPTIONS: Option<"" | "true" | "false">[] = [
    { value: "", label: "全部 Caption 文本" },
    { value: "true", label: "有 Caption" },
    { value: "false", label: "无 Caption" },
];

export const LIST_SORT_OPTIONS: Option<CaptionListSortBy>[] =
    LIST_SORT_VALUES.map((value) => ({
        value,
        label: getSortLabel(value),
    }));

export const SEARCH_SORT_OPTIONS: Option<CaptionSearchSortBy>[] =
    SEARCH_SORT_VALUES.map((value) => ({
        value,
        label: getSortLabel(value),
    }));

export const EMPTY_QUERY_STATE: CaptionQueryState = {
    query: "",
    page: 1,
    size: 20,
    sort_by: "capture_time",
    sort_order: "desc",
    device_id: "",
    plate_no: "",
    capture_time_from: "",
    capture_time_to: "",
    object_type: "",
    caption_status: "",
    embedding_status: "",
    object_id: "",
    image_id: "",
    has_caption: undefined,
    source_detail_code: "",
    colors: [],
    patterns: [],
    categories: [],
};

function isOneOf<T extends string>(
    value: string,
    values: readonly T[],
): value is T {
    return values.includes(value as T);
}

function parseBoolean(value: string | null): boolean | undefined {
    if (value === "true") return true;
    if (value === "false") return false;

    return undefined;
}

function parsePositiveNumber(value: string | null, fallback: number): number {
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sanitizeStringArray(values: string[]): string[] {
    return values
        .map((value) => value.trim())
        .filter(
            (value, index, array) =>
                value.length > 0 && array.indexOf(value) === index,
        );
}

export function readCaptionQueryState(
    searchParams: URLSearchParams,
): CaptionQueryState {
    const query = searchParams.get("query")?.trim() ?? "";
    const sortBy = searchParams.get("sort_by");
    const objectType = searchParams.get("object_type");
    const captionStatus = searchParams.get("caption_status");
    const embeddingStatus = searchParams.get("embedding_status");
    const sourceDetailCode = searchParams.get("source_detail_code");
    const defaultSortBy = query ? "relevance" : EMPTY_QUERY_STATE.sort_by;

    return {
        query,
        page: parsePositiveNumber(searchParams.get("page"), 1),
        size: parsePositiveNumber(searchParams.get("size"), 20),
        sort_by: isOneOf(sortBy ?? "", SEARCH_SORT_VALUES)
            ? sortBy
            : defaultSortBy,
        sort_order: searchParams.get("sort_order") === "asc" ? "asc" : "desc",
        device_id: searchParams.get("device_id") ?? "",
        plate_no: searchParams.get("plate_no") ?? "",
        capture_time_from: searchParams.get("capture_time_from") ?? "",
        capture_time_to: searchParams.get("capture_time_to") ?? "",
        object_type: isOneOf(objectType ?? "", OBJECT_VALUES) ? objectType : "",
        caption_status: isOneOf(captionStatus ?? "", CAPTION_STATUS_VALUES)
            ? captionStatus
            : "",
        embedding_status: isOneOf(
            embeddingStatus ?? "",
            EMBEDDING_STATUS_VALUES,
        )
            ? embeddingStatus
            : "",
        object_id: searchParams.get("object_id") ?? "",
        image_id: searchParams.get("image_id") ?? "",
        has_caption: parseBoolean(searchParams.get("has_caption")),
        source_detail_code: isOneOf(
            sourceDetailCode ?? "",
            SOURCE_DETAIL_VALUES,
        )
            ? sourceDetailCode
            : "",
        colors: sanitizeStringArray(searchParams.getAll("colors")),
        patterns: sanitizeStringArray(searchParams.getAll("patterns")),
        categories: sanitizeStringArray(searchParams.getAll("categories")),
    };
}

export function isSearchMode(query: string): boolean {
    return query.trim().length > 0;
}

export function normalizeCaptionQueryState(state: CaptionQueryState): {
    state: CaptionQueryState;
    notes: string[];
} {
    const nextState: CaptionQueryState = {
        ...state,
        query: state.query.trim(),
        page: state.page > 0 ? state.page : 1,
        size: PAGE_SIZE_OPTIONS.some((option) => option.value === state.size)
            ? state.size
            : 20,
    };
    const notes: string[] = [];
    const searching = isSearchMode(nextState.query);

    if (searching) {
        if (nextState.has_caption !== undefined) {
            nextState.has_caption = undefined;
            notes.push("语义搜索不支持 has_caption 强筛选，已自动清空。");
        }
        if (nextState.colors.length > 0) {
            nextState.colors = [];
            notes.push("语义搜索不支持 colors 强筛选，已自动清空。");
        }
        if (nextState.patterns.length > 0) {
            nextState.patterns = [];
            notes.push("语义搜索不支持 patterns 强筛选，已自动清空。");
        }
        if (nextState.categories.length > 0) {
            nextState.categories = [];
            notes.push("语义搜索不支持 categories 强筛选，已自动清空。");
        }
        if (nextState.embedding_status !== "completed") {
            if (nextState.embedding_status !== "") {
                notes.push(
                    "语义搜索仅支持 embedding_status=completed，已自动修正。",
                );
            }
            nextState.embedding_status = "completed";
        }
        if (!SEARCH_SORT_VALUES.includes(state.sort_by)) {
            nextState.sort_by = "relevance";
        }
    } else {
        if (
            !LIST_SORT_VALUES.includes(nextState.sort_by as CaptionListSortBy)
        ) {
            nextState.sort_by = "capture_time";
        }
    }

    if (!searching && nextState.sort_by === "relevance") {
        nextState.sort_by = "capture_time";
    }

    return { state: nextState, notes };
}

export function serializeCaptionQueryState(
    state: CaptionQueryState,
): URLSearchParams {
    const searchParams = new URLSearchParams();

    searchParams.set("page", String(state.page));
    searchParams.set("size", String(state.size));
    searchParams.set("sort_by", state.sort_by);
    searchParams.set("sort_order", state.sort_order);

    if (state.query) searchParams.set("query", state.query);
    if (state.device_id) searchParams.set("device_id", state.device_id);
    if (state.plate_no) searchParams.set("plate_no", state.plate_no);
    if (state.capture_time_from) {
        searchParams.set("capture_time_from", state.capture_time_from);
    }
    if (state.capture_time_to) {
        searchParams.set("capture_time_to", state.capture_time_to);
    }
    if (state.object_type) searchParams.set("object_type", state.object_type);
    if (state.caption_status) {
        searchParams.set("caption_status", state.caption_status);
    }
    if (state.embedding_status) {
        searchParams.set("embedding_status", state.embedding_status);
    }
    if (state.object_id) searchParams.set("object_id", state.object_id);
    if (state.image_id) searchParams.set("image_id", state.image_id);
    if (state.has_caption !== undefined) {
        searchParams.set("has_caption", String(state.has_caption));
    }
    if (state.source_detail_code) {
        searchParams.set("source_detail_code", state.source_detail_code);
    }

    ARRAY_KEYS.forEach((key) => {
        state[key].forEach((value) => {
            searchParams.append(key, value);
        });
    });

    return searchParams;
}

export function createDraftFromState(
    state: CaptionQueryState,
): CaptionFilterDraft {
    return {
        device_id: state.device_id,
        plate_no: state.plate_no,
        capture_time_from: state.capture_time_from,
        capture_time_to: state.capture_time_to,
        object_type: state.object_type,
        caption_status: state.caption_status,
        embedding_status: state.embedding_status,
        object_id: state.object_id,
        image_id: state.image_id,
        has_caption:
            state.has_caption === undefined ? "" : String(state.has_caption),
        source_detail_code: state.source_detail_code,
        colors: state.colors,
        patterns: state.patterns,
        categories: state.categories,
    };
}

export function createStateFromDraft(
    state: CaptionQueryState,
    draft: CaptionFilterDraft,
): CaptionQueryState {
    return {
        ...state,
        device_id: draft.device_id.trim(),
        plate_no: draft.plate_no.trim(),
        capture_time_from: draft.capture_time_from,
        capture_time_to: draft.capture_time_to,
        object_type: draft.object_type,
        caption_status: draft.caption_status,
        embedding_status: draft.embedding_status,
        object_id: draft.object_id.trim(),
        image_id: draft.image_id.trim(),
        has_caption: parseBoolean(draft.has_caption),
        source_detail_code: draft.source_detail_code,
        colors: sanitizeStringArray(draft.colors),
        patterns: sanitizeStringArray(draft.patterns),
        categories: sanitizeStringArray(draft.categories),
    };
}

function buildCommonParams(state: CaptionQueryState): CaptionListParams {
    return {
        page: state.page,
        size: state.size,
        sort_by: state.sort_by === "relevance" ? "capture_time" : state.sort_by,
        sort_order: state.sort_order,
        device_id: state.device_id || undefined,
        plate_no: state.plate_no || undefined,
        capture_time_from: state.capture_time_from || undefined,
        capture_time_to: state.capture_time_to || undefined,
        object_type: state.object_type || undefined,
        caption_status: state.caption_status || undefined,
        embedding_status: state.embedding_status || undefined,
        object_id: state.object_id || undefined,
        image_id: state.image_id || undefined,
        has_caption: state.has_caption,
        source_detail_code: state.source_detail_code || undefined,
        colors: state.colors.length > 0 ? state.colors : undefined,
        patterns: state.patterns.length > 0 ? state.patterns : undefined,
        categories: state.categories.length > 0 ? state.categories : undefined,
    };
}

export function createListParams(state: CaptionQueryState): CaptionListParams {
    return {
        ...buildCommonParams(state),
        sort_by: state.sort_by === "relevance" ? "capture_time" : state.sort_by,
    };
}

export function createSearchParams(
    state: CaptionQueryState,
): CaptionSearchParams {
    return {
        ...buildCommonParams(state),
        query: state.query,
        sort_by: SEARCH_SORT_VALUES.includes(state.sort_by)
            ? state.sort_by
            : "relevance",
    };
}

export function formatDisplayDate(value?: Date | string | null): string {
    if (!value) return "--";
    if (value instanceof Date) return date2ChineseString(value);

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date2ChineseString(date);
}

export function getObjectTypeLabel(value: CaptionObjectType | ""): string {
    switch (value) {
        case "person":
            return "人体";
        case "face":
            return "人脸";
        case "motor_vehicle":
            return "机动车";
        case "non_motor_vehicle":
            return "非机动车";
        default:
            return "--";
    }
}

export function getCaptionStatusLabel(value: CaptionStatus | ""): string {
    switch (value) {
        case "pending":
            return "待处理";
        case "processing":
            return "处理中";
        case "completed":
            return "已完成";
        case "failed":
            return "失败";
        default:
            return "--";
    }
}

export function getEmbeddingStatusLabel(
    value: CaptionEmbeddingStatus | "",
): string {
    switch (value) {
        case "blocked":
            return "已阻断";
        case "pending":
            return "待处理";
        case "processing":
            return "处理中";
        case "completed":
            return "已完成";
        case "failed":
            return "失败";
        default:
            return "--";
    }
}

export function getSourceDetailLabel(value: string): string {
    switch (value) {
        case "11":
            return "11 / person";
        case "12":
            return "12 / face";
        case "13":
            return "13 / motor_vehicle";
        case "14":
            return "14 / non_motor_vehicle";
        default:
            return value || "--";
    }
}

function getSortLabel(value: CaptionSearchSortBy): string {
    switch (value) {
        case "relevance":
            return "相关度";
        case "capture_time":
            return "抓拍时间";
        case "ingested_at":
            return "入库时间";
        case "updated_at":
            return "更新时间";
        case "device_id":
            return "设备 ID";
        case "plate_no":
            return "车牌号";
        case "object_type":
            return "目标类型";
        case "caption_status":
            return "Caption 状态";
        case "embedding_status":
            return "Embedding 状态";
        default:
            return value;
    }
}

export function getAvailableSortOptions(query: string) {
    return isSearchMode(query) ? SEARCH_SORT_OPTIONS : LIST_SORT_OPTIONS;
}

export function getDefaultSortBy(query: string): CaptionSearchSortBy {
    return isSearchMode(query) ? "relevance" : "capture_time";
}

export function getDefaultSortOrder(): CaptionSortOrder {
    return "desc";
}

export function getStatusTone(
    value: CaptionStatus | CaptionEmbeddingStatus,
): "gray" | "blue" | "green" | "red" {
    switch (value) {
        case "pending":
        case "blocked":
            return "gray";
        case "processing":
            return "blue";
        case "completed":
            return "green";
        case "failed":
            return "red";
        default:
            return "gray";
    }
}

export function resolveCaptionImageUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/caption-api")) return path;

    return `/caption-api${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatHealthStatus(
    health?: { status?: string; ok?: boolean; message?: string } | null,
): string {
    if (!health) return "未获取";
    if (health.status) return health.status;
    if (typeof health.ok === "boolean") {
        return health.ok ? "ok" : "error";
    }
    if (health.message) return health.message;

    return "正常";
}

export function formatNumber(value?: number): string {
    if (value === undefined || value === null) return "--";

    return value.toLocaleString("zh-CN");
}

export function formatScore(value?: number): string {
    if (value === undefined || value === null) return "--";

    return value.toFixed(4);
}

export function stringifyValue(value: unknown): string {
    if (value === undefined || value === null) return "--";
    if (typeof value === "string") return value;

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

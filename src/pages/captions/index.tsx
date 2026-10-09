import { ConfigProvider, DatePicker, Select, Tooltip } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import {
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import { CaptionDetailPopup } from "./components/caption-detail-popup";
import MultiValueInput from "./components/multi-value-input";
import { StatusPill } from "./components/status-pill";
import {
    CAPTION_STATUS_OPTIONS,
    CaptionFilterDraft,
    CaptionQueryState,
    EMBEDDING_STATUS_OPTIONS,
    EMPTY_QUERY_STATE,
    HAS_CAPTION_OPTIONS,
    OBJECT_TYPE_OPTIONS,
    PAGE_SIZE_OPTIONS,
    SEARCH_SORT_OPTIONS,
    SORT_ORDER_OPTIONS,
    SOURCE_DETAIL_OPTIONS,
    createDraftFromState,
    createListParams,
    createSearchParams,
    createStateFromDraft,
    formatDisplayDate,
    formatHealthStatus,
    formatNumber,
    formatScore,
    getCaptionStatusLabel,
    getDefaultSortBy,
    getDefaultSortOrder,
    getEmbeddingStatusLabel,
    getObjectTypeLabel,
    getStatusTone,
    isSearchMode,
    normalizeCaptionQueryState,
    readCaptionQueryState,
    resolveCaptionImageUrl,
    serializeCaptionQueryState,
} from "./utils";

import { api } from "@/api";
import {
    CaptionHealthResponse,
    CaptionListResponse,
    CaptionRecord,
    CaptionSourceStatusResponse,
} from "@/api/caption-types";
import { IconEmpty, IconReload, IconSearch } from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import LazyImage from "@/components/image";
import { Pagination } from "@/components/pagination";
import { Message } from "@/util/ui";

const { RangePicker } = DatePicker;

function Panel(props: {
    title: string;
    extra?: ReactNode;
    children: ReactNode;
}) {
    const { title, extra, children } = props;

    return (
        <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div className="text-lg font-semibold text-[#1f2937]">
                    {title}
                </div>
                {extra}
            </div>
            {children}
        </section>
    );
}

function StatCard(props: { label: string; value: string; subText?: string }) {
    const { label, value, subText } = props;

    return (
        <div className="rounded-3xl border border-[#dce7ef] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)] p-5">
            <div className="text-sm text-[#6b7280]">{label}</div>
            <div className="mt-3 text-3xl font-semibold text-[#0f172a]">
                {value}
            </div>
            {subText && (
                <div className="mt-2 text-xs text-[#94a3b8]">{subText}</div>
            )}
        </div>
    );
}

function FilterField(props: {
    label: string;
    children: ReactNode;
    wide?: boolean;
}) {
    const { label, children, wide = false } = props;

    return (
        <div
            className={`rounded-2xl border border-[#d9e3ec] bg-white px-4 py-3 shadow-sm ${
                wide ? "md:col-span-2" : ""
            }`}
        >
            <div className="mb-2 text-sm font-medium text-[#4b5563]">
                {label}
            </div>
            {children}
        </div>
    );
}

function CountList(props: {
    title: string;
    counts?: Record<string, number | undefined>;
    formatter: (value: string) => string;
}) {
    const { title, counts, formatter } = props;
    const entries = Object.entries(counts ?? {});

    return (
        <div className="rounded-3xl border border-[#dce7ef] bg-[#fbfdff] p-5">
            <div className="mb-4 text-sm font-semibold text-[#364153]">
                {title}
            </div>
            <div className="grid gap-2">
                {entries.length === 0 && (
                    <div className="text-sm text-[#94a3b8]">暂无数据</div>
                )}
                {entries.map(([key, value]) => (
                    <div
                        key={key}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"
                    >
                        <span className="text-[#475569]">{formatter(key)}</span>
                        <span className="font-semibold text-[#0f172a]">
                            {formatNumber(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CaptionPage() {
    const confirm = useContext(ConfirmContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsString = searchParams.toString();

    const rawState = useMemo(
        () => readCaptionQueryState(new URLSearchParams(searchParamsString)),
        [searchParamsString],
    );
    const normalizedResult = useMemo(
        () => normalizeCaptionQueryState(rawState),
        [rawState],
    );
    const pageState = normalizedResult.state;
    const rawQueryString = useMemo(
        () => serializeCaptionQueryState(rawState).toString(),
        [rawState],
    );
    const normalizedSearchParams = useMemo(
        () => serializeCaptionQueryState(pageState),
        [pageState],
    );
    const normalizedQueryString = normalizedSearchParams.toString();
    const canonicalReady = rawQueryString === normalizedQueryString;
    const normalizeNoticeRef = useRef("");

    const [searchInput, setSearchInput] = useState(pageState.query);
    const [draft, setDraft] = useState<CaptionFilterDraft>(
        createDraftFromState(pageState),
    );
    const [listLoading, setListLoading] = useState(true);
    const [listResponse, setListResponse] =
        useState<CaptionListResponse | null>(null);
    const [listRefreshSeed, setListRefreshSeed] = useState(0);
    const [statusLoading, setStatusLoading] = useState(true);
    const [health, setHealth] = useState<CaptionHealthResponse | null>(null);
    const [sourceStatus, setSourceStatus] =
        useState<CaptionSourceStatusResponse | null>(null);
    const [statusRefreshSeed, setStatusRefreshSeed] = useState(0);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
        null,
    );
    const [selectedRecordSummary, setSelectedRecordSummary] =
        useState<CaptionRecord | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailRecord, setDetailRecord] = useState<CaptionRecord | null>(
        null,
    );
    const [detailRefreshSeed, setDetailRefreshSeed] = useState(0);
    const [actionLoading, setActionLoading] = useState<
        "reprocess" | "caption" | "embedding" | null
    >(null);

    useEffect(() => {
        if (canonicalReady) return;

        const noticeKey = `${rawQueryString}=>${normalizedQueryString}`;
        if (
            normalizedResult.notes.length > 0 &&
            normalizeNoticeRef.current !== noticeKey
        ) {
            Message.warning(
                "caption-normalize",
                normalizedResult.notes.join(" "),
            );
            normalizeNoticeRef.current = noticeKey;
        }

        setSearchParams(normalizedSearchParams, { replace: true });
    }, [
        canonicalReady,
        normalizedQueryString,
        normalizedResult.notes,
        normalizedSearchParams,
        rawQueryString,
        setSearchParams,
    ]);

    useEffect(() => {
        if (!canonicalReady) return;
        setSearchInput(pageState.query);
        setDraft(createDraftFromState(pageState));
    }, [canonicalReady, pageState]);

    const commitState = useCallback(
        (builder: (current: CaptionQueryState) => CaptionQueryState) => {
            const nextState = normalizeCaptionQueryState(
                builder(pageState),
            ).state;
            setSearchParams(serializeCaptionQueryState(nextState));
        },
        [pageState, setSearchParams],
    );

    const commitDraft = useCallback(() => {
        commitState((current) => {
            const nextQuery = searchInput.trim();
            const wasSearching = isSearchMode(current.query);
            const willSearch = isSearchMode(nextQuery);

            return {
                ...createStateFromDraft(current, draft),
                query: nextQuery,
                page: 1,
                sort_by:
                    wasSearching === willSearch
                        ? current.sort_by
                        : getDefaultSortBy(nextQuery),
                sort_order:
                    wasSearching === willSearch
                        ? current.sort_order
                        : getDefaultSortOrder(),
            };
        });
    }, [commitState, draft, searchInput]);

    const clearFilters = useCallback(() => {
        const nextQuery = searchInput.trim();

        setDraft(
            createDraftFromState({ ...EMPTY_QUERY_STATE, query: nextQuery }),
        );
        commitState(() => ({
            ...EMPTY_QUERY_STATE,
            query: nextQuery,
            page: 1,
            size: pageState.size,
            sort_by: getDefaultSortBy(nextQuery),
            sort_order: getDefaultSortOrder(),
        }));
    }, [commitState, pageState.size, searchInput]);

    const refreshStatus = useCallback(async () => {
        setStatusLoading(true);
        const [healthResult, sourceStatusResult] = await Promise.allSettled([
            api.caption.health(),
            api.caption.sourceStatus(),
        ]);

        setHealth(
            healthResult.status === "fulfilled" ? healthResult.value : null,
        );
        setSourceStatus(
            sourceStatusResult.status === "fulfilled"
                ? sourceStatusResult.value
                : null,
        );
        setStatusLoading(false);
    }, []);

    useEffect(() => {
        void refreshStatus();
    }, [refreshStatus, statusRefreshSeed]);

    useEffect(() => {
        if (!canonicalReady) return;

        let cancelled = false;

        const fetchList = async () => {
            setListLoading(true);
            try {
                const response = isSearchMode(pageState.query)
                    ? await api.caption.search(createSearchParams(pageState))
                    : await api.caption.list(createListParams(pageState));

                if (!cancelled) {
                    setListResponse(response);
                }
            } finally {
                if (!cancelled) {
                    setListLoading(false);
                }
            }
        };

        void fetchList();

        return () => {
            cancelled = true;
        };
    }, [canonicalReady, listRefreshSeed, pageState]);

    useEffect(() => {
        if (!detailVisible || !selectedRecordId) return;

        let cancelled = false;

        const fetchDetail = async () => {
            setDetailLoading(true);
            try {
                const response = await api.caption.detail(selectedRecordId);
                if (!cancelled) {
                    setDetailRecord(response);
                }
            } finally {
                if (!cancelled) {
                    setDetailLoading(false);
                }
            }
        };

        void fetchDetail();

        return () => {
            cancelled = true;
        };
    }, [detailRefreshSeed, detailVisible, selectedRecordId]);

    const totalRecords = listResponse?.total ?? listResponse?.TotalNum ?? 0;
    const totalPages =
        totalRecords > 0 ? Math.ceil(totalRecords / pageState.size) : 0;
    const listItems = listResponse?.items ?? [];

    const openDetail = (record: CaptionRecord) => {
        setSelectedRecordId(record.id);
        setSelectedRecordSummary(record);
        setDetailRecord(null);
        setDetailVisible(true);
        setDetailRefreshSeed((seed) => seed + 1);
    };

    const handleAction = useCallback(
        (
            type: "reprocess" | "caption" | "embedding",
            title: string,
            subTitle: string,
            request: () => Promise<unknown>,
        ) => {
            const execute = async () => {
                setActionLoading(type);
                try {
                    await request();
                    Message.success("caption-action", "操作成功");
                    setDetailRefreshSeed((seed) => seed + 1);
                    setListRefreshSeed((seed) => seed + 1);
                    setStatusRefreshSeed((seed) => seed + 1);
                    confirm?.hideConfirm();
                } catch {
                    // Axios interceptors already surface the error to the user.
                } finally {
                    setActionLoading(null);
                }
            };

            if (confirm) {
                confirm.showConfirm(title, subTitle, execute, () => {
                    confirm.hideConfirm();
                });
                return;
            }

            void execute();
        },
        [confirm],
    );

    const activeDetailRecord = detailRecord ?? selectedRecordSummary;
    const detailImageUrl = activeDetailRecord
        ? api.caption.imageUrl(activeDetailRecord.id)
        : "";
    const activeSortOptions = isSearchMode(pageState.query)
        ? SEARCH_SORT_OPTIONS
        : SEARCH_SORT_OPTIONS.filter((option) => option.value !== "relevance");

    return (
        <div className="flex-1 min-w-0 overflow-y-auto bg-[linear-gradient(180deg,#eef7fb_0%,#f7fafc_45%,#f9fbfd_100%)] px-8 py-8">
            <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6">
                <Panel title="Easy1400 Caption 管理">
                    <div className="flex flex-col gap-6">
                        <div className="mx-auto flex h-14 w-full max-w-[920px] items-center rounded-[20px] border border-[#d7e4ed] bg-white px-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                            <div className="px-3 text-[#00aeec]">
                                <IconSearch />
                            </div>
                            <input
                                type="text"
                                value={searchInput}
                                placeholder="输入语义搜索词，例如：穿深色外套的人"
                                className="h-full flex-1 bg-transparent px-2 text-sm text-[#0f172a] outline-none"
                                onChange={(event) => {
                                    setSearchInput(event.target.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        commitDraft();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="h-11 rounded-2xl bg-[#00aeec] px-6 text-sm text-white hover:bg-[#36bef2] cursor-pointer"
                                onClick={commitDraft}
                            >
                                搜索
                            </button>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                            <StatCard
                                label="服务健康状态"
                                value={
                                    statusLoading
                                        ? "..."
                                        : formatHealthStatus(health)
                                }
                                subText="来自 GET /healthz"
                            />
                            <StatCard
                                label="总记录数"
                                value={
                                    statusLoading
                                        ? "..."
                                        : formatNumber(
                                              sourceStatus?.store
                                                  ?.total_records,
                                          )
                                }
                                subText="来自 /api/source/status"
                            />
                            <StatCard
                                label="当前结果集"
                                value={
                                    listLoading
                                        ? "..."
                                        : formatNumber(totalRecords)
                                }
                                subText={
                                    isSearchMode(pageState.query)
                                        ? "当前为语义搜索模式"
                                        : "当前为列表模式"
                                }
                            />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr]">
                            <CountList
                                title="Caption 状态统计"
                                counts={
                                    sourceStatus?.store?.caption_status_counts
                                }
                                formatter={getCaptionStatusLabel}
                            />
                            <CountList
                                title="Embedding 状态统计"
                                counts={
                                    sourceStatus?.store?.embedding_status_counts
                                }
                                formatter={getEmbeddingStatusLabel}
                            />
                            <div className="rounded-3xl border border-[#dce7ef] bg-[#fbfdff] p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="text-sm font-semibold text-[#364153]">
                                        Caption 队列
                                    </div>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 text-xs text-[#00aeec] cursor-pointer"
                                        onClick={() => {
                                            setStatusRefreshSeed(
                                                (seed) => seed + 1,
                                            );
                                        }}
                                    >
                                        <IconReload className="h-4 w-4" />
                                        刷新
                                    </button>
                                </div>
                                <div className="grid gap-3">
                                    <StatCard
                                        label="队列大小"
                                        value={formatNumber(
                                            sourceStatus?.caption_pipeline
                                                ?.queue_size,
                                        )}
                                    />
                                    <StatCard
                                        label="批处理中"
                                        value={formatNumber(
                                            sourceStatus?.caption_pipeline
                                                ?.inflight_batches,
                                        )}
                                    />
                                    <StatCard
                                        label="累计处理"
                                        value={formatNumber(
                                            sourceStatus?.caption_pipeline
                                                ?.total_processed,
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="rounded-3xl border border-[#dce7ef] bg-[#fbfdff] p-5">
                                <div className="mb-4 text-sm font-semibold text-[#364153]">
                                    Embedding 队列
                                </div>
                                <div className="grid gap-3">
                                    <StatCard
                                        label="队列大小"
                                        value={formatNumber(
                                            sourceStatus?.embedding_pipeline
                                                ?.queue_size,
                                        )}
                                    />
                                    <StatCard
                                        label="批处理中"
                                        value={formatNumber(
                                            sourceStatus?.embedding_pipeline
                                                ?.inflight_batches,
                                        )}
                                    />
                                    <StatCard
                                        label="累计处理"
                                        value={formatNumber(
                                            sourceStatus?.embedding_pipeline
                                                ?.total_processed,
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>

                <Panel
                    title="筛选与排序"
                    extra={
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="rounded-xl border border-[#d7e4ed] px-4 py-2 text-sm text-[#475569] hover:bg-[#f8fbfd] cursor-pointer"
                                onClick={clearFilters}
                            >
                                清空筛选
                            </button>
                            <button
                                type="button"
                                className="rounded-xl bg-[#0f172a] px-4 py-2 text-sm text-white hover:bg-[#1e293b] cursor-pointer"
                                onClick={commitDraft}
                            >
                                应用筛选
                            </button>
                        </div>
                    }
                >
                    <div className="grid gap-4 xl:grid-cols-4">
                        <FilterField label="目标类型">
                            <Select
                                className="w-full"
                                value={draft.object_type}
                                options={OBJECT_TYPE_OPTIONS}
                                onChange={(value) => {
                                    setDraft((current) => ({
                                        ...current,
                                        object_type: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="Caption 状态">
                            <Select
                                className="w-full"
                                value={draft.caption_status}
                                options={CAPTION_STATUS_OPTIONS}
                                onChange={(value) => {
                                    setDraft((current) => ({
                                        ...current,
                                        caption_status: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="Embedding 状态">
                            <Select
                                className="w-full"
                                value={draft.embedding_status}
                                options={EMBEDDING_STATUS_OPTIONS}
                                onChange={(value) => {
                                    setDraft((current) => ({
                                        ...current,
                                        embedding_status: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="细类编码">
                            <Select
                                className="w-full"
                                value={draft.source_detail_code}
                                options={SOURCE_DETAIL_OPTIONS}
                                onChange={(value) => {
                                    setDraft((current) => ({
                                        ...current,
                                        source_detail_code: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="是否有 Caption">
                            <Select
                                className="w-full"
                                value={draft.has_caption}
                                options={HAS_CAPTION_OPTIONS}
                                onChange={(value) => {
                                    setDraft((current) => ({
                                        ...current,
                                        has_caption: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="设备 ID">
                            <input
                                type="text"
                                value={draft.device_id}
                                className="h-10 w-full rounded-xl border border-[#d9e3ec] px-3 text-sm outline-none focus:border-[#00aeec]"
                                onChange={(event) => {
                                    setDraft((current) => ({
                                        ...current,
                                        device_id: event.target.value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="车牌号">
                            <input
                                type="text"
                                value={draft.plate_no}
                                className="h-10 w-full rounded-xl border border-[#d9e3ec] px-3 text-sm outline-none focus:border-[#00aeec]"
                                onChange={(event) => {
                                    setDraft((current) => ({
                                        ...current,
                                        plate_no: event.target.value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="目标 ID">
                            <input
                                type="text"
                                value={draft.object_id}
                                className="h-10 w-full rounded-xl border border-[#d9e3ec] px-3 text-sm outline-none focus:border-[#00aeec]"
                                onChange={(event) => {
                                    setDraft((current) => ({
                                        ...current,
                                        object_id: event.target.value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="图片 ID">
                            <input
                                type="text"
                                value={draft.image_id}
                                className="h-10 w-full rounded-xl border border-[#d9e3ec] px-3 text-sm outline-none focus:border-[#00aeec]"
                                onChange={(event) => {
                                    setDraft((current) => ({
                                        ...current,
                                        image_id: event.target.value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="排序字段">
                            <Select
                                className="w-full"
                                value={pageState.sort_by}
                                options={activeSortOptions}
                                onChange={(value) => {
                                    commitState((current) => ({
                                        ...current,
                                        page: 1,
                                        sort_by: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="排序方式">
                            <Select
                                className="w-full"
                                value={pageState.sort_order}
                                options={SORT_ORDER_OPTIONS}
                                onChange={(value) => {
                                    commitState((current) => ({
                                        ...current,
                                        page: 1,
                                        sort_order: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="每页数量">
                            <Select
                                className="w-full"
                                value={pageState.size}
                                options={PAGE_SIZE_OPTIONS}
                                onChange={(value) => {
                                    commitState((current) => ({
                                        ...current,
                                        page: 1,
                                        size: value,
                                    }));
                                }}
                            />
                        </FilterField>
                        <FilterField label="抓拍时间范围" wide>
                            <ConfigProvider locale={zhCN}>
                                <RangePicker
                                    showTime
                                    className="w-full"
                                    value={
                                        draft.capture_time_from &&
                                        draft.capture_time_to
                                            ? [
                                                  dayjs(
                                                      draft.capture_time_from,
                                                  ),
                                                  dayjs(draft.capture_time_to),
                                              ]
                                            : null
                                    }
                                    onChange={(value) => {
                                        setDraft((current) => ({
                                            ...current,
                                            capture_time_from:
                                                value?.[0]?.toISOString() ?? "",
                                            capture_time_to:
                                                value?.[1]?.toISOString() ?? "",
                                        }));
                                    }}
                                />
                            </ConfigProvider>
                        </FilterField>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                        <MultiValueInput
                            label="颜色标签"
                            placeholder="输入颜色后回车，例如 black"
                            values={draft.colors}
                            onChange={(values) => {
                                setDraft((current) => ({
                                    ...current,
                                    colors: values,
                                }));
                            }}
                        />
                        <MultiValueInput
                            label="图案标签"
                            placeholder="输入图案后回车，例如 stripe"
                            values={draft.patterns}
                            onChange={(values) => {
                                setDraft((current) => ({
                                    ...current,
                                    patterns: values,
                                }));
                            }}
                        />
                        <MultiValueInput
                            label="类别标签"
                            placeholder="输入类别后回车，例如 coat"
                            values={draft.categories}
                            onChange={(values) => {
                                setDraft((current) => ({
                                    ...current,
                                    categories: values,
                                }));
                            }}
                        />
                    </div>
                </Panel>

                <Panel
                    title="结果列表"
                    extra={
                        <div className="text-sm text-[#64748b]">
                            {isSearchMode(pageState.query)
                                ? `语义搜索模式，共 ${formatNumber(totalRecords)} 条结果`
                                : `列表模式，共 ${formatNumber(totalRecords)} 条记录`}
                        </div>
                    }
                >
                    {listLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: pageState.size }).map(
                                (_, index) => (
                                    <div
                                        key={`caption-skeleton-${index}`}
                                        className="overflow-hidden rounded-[28px] border border-[#dce7ef] bg-white"
                                    >
                                        <div className="aspect-video animate-pulse bg-[#d8e3ec]" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-4 animate-pulse rounded bg-[#eef4f8]" />
                                            <div className="h-4 animate-pulse rounded bg-[#eef4f8]" />
                                            <div className="h-16 animate-pulse rounded bg-[#eef4f8]" />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    ) : listItems.length ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {listItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="overflow-hidden rounded-[28px] border border-[#dce7ef] bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]"
                                    >
                                        <LazyImage
                                            src={resolveCaptionImageUrl(
                                                item.image_url,
                                            )}
                                            lazy={false}
                                            className="aspect-video cursor-pointer bg-[#d8e3ec]"
                                            onClick={() => {
                                                openDetail(item);
                                            }}
                                        >
                                            <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-[linear-gradient(180deg,rgba(15,23,42,0.65)_0%,rgba(15,23,42,0)_100%)] p-3">
                                                <span className="rounded-full bg-white/90 px-2 py-1 text-xs text-[#0f172a]">
                                                    {getObjectTypeLabel(
                                                        item.object_type,
                                                    )}
                                                </span>
                                                {item.score !== undefined && (
                                                    <span className="rounded-full bg-[#00aeec] px-2 py-1 text-xs text-white">
                                                        score{" "}
                                                        {formatScore(
                                                            item.score,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </LazyImage>
                                        <div className="space-y-4 p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <StatusPill
                                                    text={`Caption ${getCaptionStatusLabel(item.caption_status)}`}
                                                    tone={getStatusTone(
                                                        item.caption_status,
                                                    )}
                                                    tooltip={
                                                        item.caption_error ||
                                                        undefined
                                                    }
                                                />
                                                <StatusPill
                                                    text={`Embedding ${getEmbeddingStatusLabel(item.embedding_status)}`}
                                                    tone={getStatusTone(
                                                        item.embedding_status,
                                                    )}
                                                    tooltip={
                                                        item.embedding_error ||
                                                        undefined
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 text-sm text-[#475569]">
                                                <div className="font-medium text-[#0f172a]">
                                                    {formatDisplayDate(
                                                        item.capture_time,
                                                    )}
                                                </div>
                                                <div>
                                                    设备：
                                                    {item.device_id || "--"}
                                                </div>
                                                <div>
                                                    车牌：
                                                    {item.plate_no || "--"}
                                                </div>
                                            </div>
                                            <Tooltip
                                                title={
                                                    item.caption_text ||
                                                    "暂无 Caption"
                                                }
                                            >
                                                <div className="min-h-[64px] text-sm leading-6 text-[#475569] line-clamp-3">
                                                    {item.caption_text ||
                                                        "暂无 Caption 文本"}
                                                </div>
                                            </Tooltip>
                                            {item.hit && (
                                                <div className="rounded-2xl bg-[#eef9ff] p-3 text-sm text-[#03698d]">
                                                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em]">
                                                        Hit
                                                    </div>
                                                    <Tooltip title={item.hit}>
                                                        <div className="line-clamp-2">
                                                            {item.hit}
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                className="w-full rounded-2xl border border-[#d7e4ed] px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fbfd] cursor-pointer"
                                                onClick={() => {
                                                    openDetail(item);
                                                }}
                                            >
                                                查看详情
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <Pagination
                                        total={totalPages}
                                        defaultValue={1}
                                        curPage={pageState.page}
                                        onChange={(page) => {
                                            commitState((current) => ({
                                                ...current,
                                                page,
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-[320px] flex-col items-center justify-center text-[#94a3b8]">
                            <div className="h-20 w-20">
                                <IconEmpty />
                            </div>
                            <div className="mt-4 text-lg">暂无结果</div>
                            <div className="mt-2 text-sm">
                                可以尝试调整筛选条件或更换搜索词
                            </div>
                        </div>
                    )}
                </Panel>
            </div>

            <CaptionDetailPopup
                show={detailVisible}
                loading={detailLoading}
                record={activeDetailRecord}
                imageUrl={detailImageUrl}
                actionLoading={actionLoading}
                onClose={() => {
                    setDetailVisible(false);
                }}
                onReprocess={() => {
                    if (!activeDetailRecord) return;
                    handleAction(
                        "reprocess",
                        "确认整条重跑？",
                        "该操作会重新执行 caption 和 embedding。",
                        () => api.caption.reprocess(activeDetailRecord.id),
                    );
                }}
                onReprocessCaption={() => {
                    if (!activeDetailRecord) return;
                    handleAction(
                        "caption",
                        "确认重跑 Caption？",
                        "该操作会重新执行 caption 阶段。",
                        () =>
                            api.caption.reprocessCaption(activeDetailRecord.id),
                    );
                }}
                onReprocessEmbedding={() => {
                    if (!activeDetailRecord) return;
                    handleAction(
                        "embedding",
                        "确认重跑 Embedding？",
                        "该操作会重新执行 embedding 阶段。",
                        () =>
                            api.caption.reprocessEmbedding(
                                activeDetailRecord.id,
                            ),
                    );
                }}
            />
        </div>
    );
}

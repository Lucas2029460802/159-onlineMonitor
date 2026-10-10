import { Tooltip } from "antd";
import { FC, useRef } from "react";

import { StatusPill } from "./status-pill";
import {
    formatDisplayDate,
    getCaptionStatusLabel,
    getEmbeddingStatusLabel,
    getObjectTypeLabel,
    getSourceDetailLabel,
    getStatusTone,
    stringifyValue,
} from "../utils";

import { CaptionRecord } from "@/api/caption-types";
import { IconClose } from "@/assets/svg";
import { PageLoading } from "@/components/page-loading";
import { Popup } from "@/components/popup";
import InfoRow from "@/pages/bigpic/components/inforow";

interface CaptionDetailPopupProps {
    show: boolean;
    loading: boolean;
    record: CaptionRecord | null;
    imageUrl: string;
    actionLoading: "reprocess" | "caption" | "embedding" | null;
    onClose: () => void;
    onReprocess: () => void;
    onReprocessCaption: () => void;
    onReprocessEmbedding: () => void;
}

function DetailChipList(props: { title: string; values: string[] }) {
    const { title, values } = props;

    return (
        <div className="rounded-2xl border border-[#e5eef5] bg-[#fbfdff] p-4">
            <div className="mb-3 text-sm font-semibold text-[#364153]">
                {title}
            </div>
            <div className="flex flex-wrap gap-2">
                {values.length === 0 && (
                    <div className="text-sm text-[#9ca3af]">暂无</div>
                )}
                {values.map((value) => (
                    <span
                        key={value}
                        className="rounded-full bg-[#e6f7fe] px-3 py-1 text-xs text-[#0079a5]"
                    >
                        {value}
                    </span>
                ))}
            </div>
        </div>
    );
}

export const CaptionDetailPopup: FC<CaptionDetailPopupProps> = ({
    show,
    loading,
    record,
    imageUrl,
    actionLoading,
    onClose,
    onReprocess,
    onReprocessCaption,
    onReprocessEmbedding,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const embeddingDisabledReason =
        record?.caption_status === "completed"
            ? ""
            : "仅当 caption_status=completed 时才能重跑 embedding";

    return (
        <Popup
            show={show}
            ref={popupRef}
            className="w-[92vw] h-[92vh] rounded-2xl overflow-hidden bg-white"
        >
            <div className="grid h-full grid-rows-[72px_1fr]">
                <div className="flex items-center justify-between border-b border-[#e5eef5] px-8">
                    <div>
                        <div className="text-lg font-semibold text-[#1f2937]">
                            Caption 详情
                        </div>
                        {record && (
                            <div className="mt-1 text-sm text-[#6b7280]">
                                记录 ID：{record.id}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        className="cursor-pointer text-[#6b7280] hover:text-[#111827]"
                        onClick={onClose}
                    >
                        <IconClose className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid h-full min-h-0 grid-cols-[1.1fr_0.9fr] gap-0">
                    <div className="min-h-0 overflow-auto border-r border-[#e5eef5] bg-[#f7fafc] p-6">
                        {loading ? (
                            <PageLoading
                                title="加载详情中"
                                description="正在获取记录详情"
                            />
                        ) : (
                            <div className="flex h-full flex-col gap-4">
                                <div className="min-h-[360px] overflow-hidden rounded-2xl bg-[#d8e3ec]">
                                    {record ? (
                                        <img
                                            src={imageUrl}
                                            alt={record.id}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[#6b7280]">
                                            暂无图片
                                        </div>
                                    )}
                                </div>

                                {record && (
                                    <>
                                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                                            <div className="mb-4 text-base font-semibold text-[#1f2937]">
                                                基础信息
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                <InfoRow
                                                    label="目标类型"
                                                    value={getObjectTypeLabel(
                                                        record.object_type,
                                                    )}
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="抓拍时间"
                                                    value={formatDisplayDate(
                                                        record.capture_time,
                                                    )}
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="设备 ID"
                                                    value={
                                                        record.device_id || "--"
                                                    }
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="车牌号"
                                                    value={
                                                        record.plate_no || "--"
                                                    }
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="细类编码"
                                                    value={getSourceDetailLabel(
                                                        record.source_detail_code,
                                                    )}
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="图片 ID"
                                                    value={
                                                        record.image_id || "--"
                                                    }
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="目标 ID"
                                                    value={
                                                        record.object_id || "--"
                                                    }
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                                <InfoRow
                                                    label="更新时间"
                                                    value={formatDisplayDate(
                                                        record.updated_at,
                                                    )}
                                                    popupContainer={
                                                        popupRef.current
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                                            <div className="mb-4 flex flex-wrap gap-3">
                                                <StatusPill
                                                    text={`Caption ${getCaptionStatusLabel(
                                                        record.caption_status,
                                                    )}`}
                                                    tone={getStatusTone(
                                                        record.caption_status,
                                                    )}
                                                    tooltip={
                                                        record.caption_error ||
                                                        undefined
                                                    }
                                                />
                                                <StatusPill
                                                    text={`Embedding ${getEmbeddingStatusLabel(
                                                        record.embedding_status,
                                                    )}`}
                                                    tone={getStatusTone(
                                                        record.embedding_status,
                                                    )}
                                                    tooltip={
                                                        record.embedding_error ||
                                                        undefined
                                                    }
                                                />
                                            </div>
                                            <div className="rounded-2xl border border-[#e5eef5] bg-[#fbfdff] p-4">
                                                <div className="mb-3 text-sm font-semibold text-[#364153]">
                                                    Caption 文本
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                                                    {record.caption_text ||
                                                        "暂无 Caption 文本"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <DetailChipList
                                                title="颜色标签"
                                                values={record.colors}
                                            />
                                            <DetailChipList
                                                title="图案标签"
                                                values={record.patterns}
                                            />
                                            <DetailChipList
                                                title="类别标签"
                                                values={record.categories}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="min-h-0 overflow-auto p-6">
                        {record && (
                            <div className="flex flex-col gap-4">
                                <div className="rounded-2xl border border-[#e5eef5] bg-[#fbfdff] p-5">
                                    <div className="mb-4 text-base font-semibold text-[#1f2937]">
                                        管理操作
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            className="rounded-xl bg-[#00aeec] px-4 py-2 text-sm text-white hover:bg-[#36bef2] cursor-pointer disabled:cursor-not-allowed disabled:bg-[#9fdff6]"
                                            disabled={actionLoading !== null}
                                            onClick={onReprocess}
                                        >
                                            {actionLoading === "reprocess"
                                                ? "重跑中..."
                                                : "整条重跑"}
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-xl border border-[#00aeec] px-4 py-2 text-sm text-[#00aeec] hover:bg-[#e6f7fe] cursor-pointer disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]"
                                            disabled={actionLoading !== null}
                                            onClick={onReprocessCaption}
                                        >
                                            {actionLoading === "caption"
                                                ? "重跑中..."
                                                : "仅重跑 Caption"}
                                        </button>
                                        <Tooltip
                                            title={embeddingDisabledReason}
                                        >
                                            <span>
                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-[#0f766e] px-4 py-2 text-sm text-[#0f766e] hover:bg-[#ecfeff] cursor-pointer disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]"
                                                    disabled={
                                                        actionLoading !==
                                                            null ||
                                                        record.caption_status !==
                                                            "completed"
                                                    }
                                                    onClick={
                                                        onReprocessEmbedding
                                                    }
                                                >
                                                    {actionLoading ===
                                                    "embedding"
                                                        ? "重跑中..."
                                                        : "仅重跑 Embedding"}
                                                </button>
                                            </span>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#e5eef5] bg-[#fbfdff] p-5">
                                    <div className="mb-4 text-base font-semibold text-[#1f2937]">
                                        失败信息
                                    </div>
                                    <div className="grid gap-4">
                                        <div>
                                            <div className="mb-2 text-sm font-medium text-[#364153]">
                                                Caption 错误
                                            </div>
                                            <div className="rounded-xl bg-white p-3 text-sm text-[#4b5563]">
                                                {record.caption_error || "暂无"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 text-sm font-medium text-[#364153]">
                                                Embedding 错误
                                            </div>
                                            <div className="rounded-xl bg-white p-3 text-sm text-[#4b5563]">
                                                {record.embedding_error ||
                                                    "暂无"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#e5eef5] bg-[#fbfdff] p-5">
                                    <div className="mb-4 text-base font-semibold text-[#1f2937]">
                                        结构化属性
                                    </div>
                                    <pre className="overflow-auto rounded-xl bg-white p-3 text-xs leading-5 text-[#334155]">
                                        {stringifyValue(record.pairs)}
                                    </pre>
                                </div>

                                <div className="rounded-2xl border border-[#e5eef5] bg-[#fbfdff] p-5">
                                    <div className="mb-4 text-base font-semibold text-[#1f2937]">
                                        原始扩展信息
                                    </div>
                                    <pre className="overflow-auto rounded-xl bg-white p-3 text-xs leading-5 text-[#334155]">
                                        {stringifyValue(record.raw_ext)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Popup>
    );
};

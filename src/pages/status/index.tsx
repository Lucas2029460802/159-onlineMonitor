import {
    FC,
    type ReactNode,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { twMerge } from "tailwind-merge";

import { StatisticsPanel } from "./components/statistics-panel";

import { api } from "@/api";
import type { PlatformStatistics } from "@/api/type";
import { OccupyTable } from "@/components/occupy-table";

const CONFIG_KEY_MAP: Record<string, string> = {
    analysis_upload_url: "分析结果上传地址",
    caption_upload_url: "Caption 告警上传地址",
    cpu_per_face: "人脸检测 CPU 核数",
    cpu_per_masa: "MASA 单实例 CPU 核数",
    embedding_cores: "Embedding 核心数",
    face_cuda: "人脸检测 CUDA 设备",
    face_nums: "人脸检测实例数",
    flow_interval: "流量统计间隔(秒)",
    flow_upload_url: "流量数据上传地址",
    gif_caption: "GIF Caption 开关",
    masa_cuda_devices: "MASA CUDA 设备列表",
    masa_nums: "MASA 实例总数",
    masa_per_gpu: "每 GPU MASA 数",
    masa_score_thr: "MASA 置信度阈值",
    max_seconds_per_event: "单事件最大时长(秒)",
    max_workders_per_video: "单视频最大工作线程",
    milvus_uri: "Milvus 向量库地址",
    min_available_memory: "最小可用内存(GB)",
    mog_nums: "MOG 实例数",
    num_training_mog: "训练 MOG 数量",
    preprocess_nums: "预处理线程数",
    production: "生产环境标志",
    qwen_nums: "Qwen 实例数",
    target_fps: "目标帧率",
    GO_BACKEND_URL: "Go 后端回调地址",
    MILVUS_DB_NAME: "Milvus 数据库名",
    MILVUS_FACE_COLLECTION: "Milvus 人脸集合",
    MILVUS_BERT_COLLECTION: "Milvus 文本集合",
    FFMPEG_PATH: "FFmpeg 路径",
};

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "是" : "否";
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

interface ConfigItemProps {
    enKey: string;
    value: unknown;
}

const ConfigItem: FC<ConfigItemProps> = ({ enKey, value }) => {
    const cnKey = CONFIG_KEY_MAP[enKey];
    const hasTranslation = cnKey !== undefined && cnKey !== enKey;
    return (
        <div className="flex items-start gap-2 py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
            <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text-8">
                    {hasTranslation ? cnKey : enKey}
                </div>
                {hasTranslation && (
                    <div className="text-xs text-text-6 mt-0.5">{enKey}</div>
                )}
            </div>
            <div className="text-sm text-text-5 max-w-[50%] text-right break-all">
                {formatValue(value)}
            </div>
        </div>
    );
};

const SectionTitle: FC<{ title: string }> = ({ title }) => (
    <div className="text-base font-semibold text-text-8 flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-1 rounded-full" />
        {title}
    </div>
);

const SectionPanel: FC<{
    title: string;
    children: ReactNode;
    action?: ReactNode;
}> = ({ title, children, action }) => (
    <section
        className={twMerge(
            "rounded-lg bg-white p-4",
            "shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_0_rgba(0,0,0,0.02)]",
        )}
    >
        <div className="mb-3 flex items-center justify-between gap-3">
            <SectionTitle title={title} />
            {action}
        </div>
        {children}
    </section>
);

function parseLogLine(line: string) {
    const match = line.match(
        /^\[([^\]]+)\]\s+(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})\s*(.*)$/,
    );
    if (!match) {
        return {
            level: "LOG",
            time: "",
            message: line,
        };
    }
    return {
        level: match[1],
        time: match[2],
        message: match[3],
    };
}

function getLogLevelClass(level: string): string {
    const normalized = level.toUpperCase();
    if (normalized.includes("ERROR")) return "text-[#d4380d] bg-[#fff2e8]";
    if (normalized.includes("WARN")) return "text-[#d48806] bg-[#fff7e6]";
    if (normalized.includes("INFO")) return "text-blue-600 bg-blue-50";
    return "text-text-6 bg-gray-100";
}

const LogItem: FC<{ line: string }> = ({ line }) => {
    const log = parseLogLine(line);
    return (
        <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
            <span
                className={twMerge(
                    "shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-5",
                    getLogLevelClass(log.level),
                )}
            >
                {log.level}
            </span>
            {log.time && (
                <span className="shrink-0 font-mono text-xs leading-6 text-text-6">
                    {log.time}
                </span>
            )}
            <span className="min-w-0 flex-1 break-all text-sm leading-6 text-text-5">
                {log.message}
            </span>
        </div>
    );
};

function normalizeStatistics(data: PlatformStatistics): PlatformStatistics {
    return {
        ...data,
        bootTime:
            data.bootTime instanceof Date
                ? data.bootTime
                : new Date(data.bootTime),
    };
}

function getErrorMessage(err: unknown): string {
    const error = err as {
        message?: string;
        response?: {
            data?: {
                Message?: string;
                message?: string;
            };
        };
    };
    return (
        error.response?.data?.Message ??
        error.response?.data?.message ??
        error.message ??
        "未知错误"
    );
}

export const Status: FC = () => {
    const [backendLog, setBackendLog] = useState<string>("");
    const [algoLog, setAlgoLog] = useState<string>("");
    const [total, setTotal] = useState<number>(0);
    const [used, setUsed] = useState<number>(0);
    const [free, setFree] = useState<number>(0);
    const [percent, setPercent] = useState<number>(0);
    const [statistics, setStatistics] = useState<PlatformStatistics | null>(
        null,
    );
    const [statisticsLoading, setStatisticsLoading] = useState<boolean>(true);
    const [statisticsError, setStatisticsError] = useState<string>("");
    const [config, setConfig] = useState<Record<string, unknown> | null>(null);
    const [configLoading, setConfigLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<"Backend" | "Algorithm">(
        "Backend",
    );
    const LogType = ["Backend", "Algorithm"];

    useLayoutEffect(() => {
        document.title = "视频浓缩 - 数据中台";
    }, []);

    useEffect(() => {
        api.log().then((res) => {
            setBackendLog(res.Data ?? "");
        });
        api.alglog().then((res) => {
            setAlgoLog(res.Data ?? "");
        });
        api.storage().then((res) => {
            setTotal(res.Data?.Total ?? 0);
            setUsed(res.Data?.Used ?? 0);
            setFree(res.Data?.Free ?? 0);
            setPercent(res.Data?.UsedPercent ?? 0);
        });
        api.statusStatistics()
            .then((res) => {
                if (res.Data) {
                    setStatistics(normalizeStatistics(res.Data));
                    setStatisticsError("");
                } else {
                    setStatistics(null);
                    setStatisticsError("统计接口未返回统计数据");
                }
            })
            .catch((err) => {
                setStatistics(null);
                setStatisticsError(`统计数据加载失败：${getErrorMessage(err)}`);
            })
            .finally(() => {
                setStatisticsLoading(false);
            });
        api.rpcConfig()
            .then((res) => {
                setConfig(res.Data ?? null);
            })
            .catch(() => {
                setConfig(null);
            })
            .finally(() => {
                setConfigLoading(false);
            });
    }, []);

    const currentLog = activeTab === "Backend" ? backendLog : algoLog;
    const currentLogLines = currentLog
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .reverse();
    const configEntries = config ? Object.entries(config) : [];

    return (
        <div className="flex-1 p-4 overflow-y-auto text-sm flex flex-col gap-4">
            {statisticsLoading ? (
                <SectionPanel title="数据统计">
                    <div className="text-text-6 py-8 text-center">
                        统计数据加载中...
                    </div>
                </SectionPanel>
            ) : statisticsError ? (
                <SectionPanel title="数据统计">
                    <div className="rounded-lg bg-[#fff2e8] px-4 py-3 text-[#d4380d]">
                        <div className="text-sm font-semibold">
                            统计数据加载失败
                        </div>
                        <div className="mt-1 break-all text-sm">
                            {statisticsError}
                        </div>
                    </div>
                </SectionPanel>
            ) : statistics ? (
                <StatisticsPanel data={statistics} />
            ) : (
                <SectionPanel title="数据统计">
                    <div className="text-text-6 py-8 text-center">
                        暂无统计数据
                    </div>
                </SectionPanel>
            )}

            <SectionPanel title="存储占用">
                <OccupyTable
                    percent={percent}
                    used={used}
                    total={total}
                    free={free}
                />
            </SectionPanel>

            <SectionPanel title="算法端配置">
                {configLoading ? (
                    <div className="text-text-6 py-8 text-center">
                        配置加载中...
                    </div>
                ) : configEntries.length === 0 ? (
                    <div className="text-text-6 py-8 text-center">
                        暂无配置信息
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {configEntries.map(([key, value]) => (
                            <ConfigItem key={key} enKey={key} value={value} />
                        ))}
                    </div>
                )}
            </SectionPanel>

            <SectionPanel
                title="运行日志"
                action={
                    <div className="flex rounded-lg bg-gray-50 p-1">
                        {LogType.map((tab) => (
                            <button
                                key={tab}
                                className={twMerge(
                                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                                    activeTab === tab
                                        ? "bg-white text-blue-600 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                                        : "text-text-6 hover:text-text-8",
                                )}
                                onClick={() =>
                                    setActiveTab(tab as "Backend" | "Algorithm")
                                }
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                }
            >
                {currentLogLines.length === 0 ? (
                    <div className="text-text-6 py-8 text-center">
                        暂无日志信息
                    </div>
                ) : (
                    <div className="grid max-h-[460px] grid-cols-1 gap-1.5 overflow-y-auto">
                        {currentLogLines.map((item, index) => (
                            <LogItem
                                key={`${activeTab}-log-${index}`}
                                line={item}
                            />
                        ))}
                    </div>
                )}
            </SectionPanel>
        </div>
    );
};

import dayjs from "dayjs";
import { type FC, useMemo } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

import type { PlatformStatistics } from "@/api/type";

export type { PlatformStatistics };

const CATEGORY_META = [
    { key: "person", label: "人员", color: "#1677FF" },
    { key: "car", label: "车辆", color: "#13A8A8" },
    { key: "bike", label: "非机动车", color: "#22A06B" },
    { key: "other", label: "其它", color: "#D48806" },
] as const;

function formatDuration(totalSeconds: number): string {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d} 天`);
    if (h > 0) parts.push(`${h} 小时`);
    if (m > 0) parts.push(`${m} 分`);
    if (d === 0 && h === 0) parts.push(`${s} 秒`);
    return parts.join(" ");
}

function formatNumber(n: number): string {
    return n.toLocaleString("zh-CN");
}

function formatAxisTick(value: string | number): string {
    if (typeof value !== "number") return value;
    if (Math.abs(value) >= 1000) {
        const shortValue = value / 1000;
        return `${Number.isInteger(shortValue) ? shortValue : shortValue.toFixed(1)}k`;
    }
    return value.toString();
}

const SectionTitle: FC<{ title: string }> = ({ title }) => (
    <div className="text-base font-semibold text-text-8 mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-1 rounded-full" />
        {title}
    </div>
);

interface InfoBlockProps {
    label: string;
    value: string;
    helper?: string;
    accent?: string;
}

const InfoBlock: FC<InfoBlockProps> = ({
    label,
    value,
    helper,
    accent = "#00a1d6",
}) => (
    <div className="flex items-start gap-2 py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
        <div
            className="mt-1 h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: accent }}
        />
        <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-text-8">{label}</div>
            {helper && (
                <div className="text-xs text-text-6 mt-0.5">{helper}</div>
            )}
        </div>
        <div className="text-sm font-semibold text-text-5 max-w-[52%] text-right break-all">
            {value}
        </div>
    </div>
);

const BrowserCompatBanner: FC<{ version: number }> = ({ version }) => (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="min-w-0 flex items-center gap-2">
            <div className="text-sm font-semibold text-blue-600">
                浏览器适配版本（&gt;={version}）
            </div>
            <div className="text-xs text-text-6">
                Chrome / Edge 内核建议版本，低版本可能影响视频解析与图表渲染
            </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
            <a
                href="/api/download/manual"
                download
                className="inline-flex items-center gap-1.5 rounded-md bg-[#22A06B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a8559] transition-colors"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                下载操作手册
            </a>
            <a
                href="/api/download/chrome"
                download
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                下载 Chrome
            </a>
        </div>
    </div>
);

const tooltipFormatter = (value: unknown) => formatNumber(Number(value));

const chartTooltipStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    fontSize: 12,
};

const chartTick = { fontSize: 11, fill: "#505050", fontWeight: 600 };

const ChartBlock: FC<{
    title: string;
    className?: string;
    children: React.ReactNode;
}> = ({ title, className, children }) => (
    <div className={twMerge("rounded-lg bg-gray-50 p-2.5", className)}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-text-8">{title}</div>
        </div>
        {children}
    </div>
);

const ChartLegend: FC<{
    items: { name: string; value: number; color: string }[];
}> = ({ items }) => {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return (
        <div className="mt-1 grid grid-cols-1 gap-1">
            {items.map((item) => {
                const percent =
                    total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                return (
                    <div
                        key={item.name}
                        className="flex min-w-0 items-center justify-between gap-2 text-xs"
                    >
                        <span className="flex min-w-0 items-center gap-1.5 text-text-6">
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate">{item.name}</span>
                            <span className="shrink-0 font-mono text-blue-600">
                                {percent}%
                            </span>
                        </span>
                        <span className="shrink-0 font-mono text-text-5">
                            {formatNumber(item.value)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const QueueLegend: FC<{
    processing: number;
    waiting: number;
}> = ({ processing, waiting }) => (
    <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-white px-2 py-1.5">
            <div className="text-text-6">处理中</div>
            <div className="mt-0.5 font-mono font-semibold text-blue-600">
                {formatNumber(processing)}
            </div>
        </div>
        <div className="rounded-md bg-white px-2 py-1.5">
            <div className="text-text-6">等待中</div>
            <div className="mt-0.5 font-mono font-semibold text-[#D48806]">
                {formatNumber(waiting)}
            </div>
        </div>
    </div>
);

interface StatisticsPanelProps {
    data: PlatformStatistics;
}

export const StatisticsPanel: FC<StatisticsPanelProps> = ({ data }) => {
    const categoryData = useMemo(
        () =>
            CATEGORY_META.map((c) => ({
                name: c.label,
                value: data.eventBreakdown[c.key],
                color: c.color,
            })),
        [data],
    );

    const queueData = useMemo(
        () => [
            {
                name: "处理中",
                value: data.processingVideoCount,
                fill: "#1677FF",
            },
            {
                name: "等待中",
                value: data.waitingVideoCount,
                fill: "#D48806",
            },
        ],
        [data.processingVideoCount, data.waitingVideoCount],
    );

    const uptimeSec = Math.floor((Date.now() - data.bootTime.getTime()) / 1000);

    return (
        <section
            className={twMerge(
                "rounded-lg bg-white p-4",
                "shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_0_rgba(0,0,0,0.02)]",
            )}
        >
            <SectionTitle title="数据统计" />

            <BrowserCompatBanner version={data.compatibleBrowserVersion} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                <InfoBlock
                    label="当前正在处理的视频数量"
                    value={`${formatNumber(data.processingVideoCount)} 条`}
                    helper="实时任务并发占用"
                    accent="#1677FF"
                />
                <InfoBlock
                    label="等待处理的视频数量"
                    value={`${formatNumber(data.waitingVideoCount)} 条`}
                    helper="排队等待调度的视频"
                    accent="#D48806"
                />
                <InfoBlock
                    label="任务总数"
                    value={`${formatNumber(data.taskTotal)} 个`}
                    accent="#13A8A8"
                />
                <InfoBlock
                    label="视频总数"
                    value={`${formatNumber(data.videoTotal)} 条`}
                    accent="#13A8A8"
                />
                <InfoBlock
                    label="视频总时长"
                    value={formatDuration(data.videoDurationSec)}
                    accent="#22A06B"
                />
                <InfoBlock
                    label="累计事件数"
                    value={`${formatNumber(data.eventTotal)} 件`}
                    accent="#D48806"
                />
                <InfoBlock
                    label="累计运行时长"
                    value={formatDuration(uptimeSec)}
                    helper={dayjs(data.bootTime).format("YYYY-MM-DD HH:mm:ss")}
                    accent="#60758A"
                />
            </div>

            <div className="grid grid-cols-1 items-start gap-2 mt-2 lg:grid-cols-2 xl:grid-cols-12">
                <ChartBlock title="近 7 日事件趋势" className="xl:col-span-5">
                    <ResponsiveContainer width="100%" height={162}>
                        <AreaChart
                            data={data.eventTrend}
                            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="compactTrendFill"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#1677FF"
                                        stopOpacity={0.34}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#1677FF"
                                        stopOpacity={0.04}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                stroke="#e5e7eb"
                                strokeDasharray="3 5"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={chartTick}
                                interval={0}
                                tickMargin={6}
                                height={24}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={chartTick}
                                tickFormatter={formatAxisTick}
                                tickMargin={6}
                                width={48}
                            />
                            <Tooltip
                                contentStyle={chartTooltipStyle}
                                formatter={tooltipFormatter}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="事件数"
                                stroke="#1677FF"
                                strokeWidth={2}
                                fill="url(#compactTrendFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartBlock>

                <ChartBlock title="类别数量对比" className="xl:col-span-3">
                    <ResponsiveContainer width="100%" height={162}>
                        <BarChart
                            data={categoryData}
                            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                stroke="#e5e7eb"
                                strokeDasharray="3 5"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={chartTick}
                                interval={0}
                                tickMargin={6}
                                height={24}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={chartTick}
                                tickFormatter={formatAxisTick}
                                tickMargin={6}
                                width={48}
                            />
                            <Tooltip
                                contentStyle={chartTooltipStyle}
                                formatter={tooltipFormatter}
                            />
                            <Bar
                                dataKey="value"
                                name="事件数"
                                radius={[5, 5, 0, 0]}
                            >
                                {categoryData.map((item) => (
                                    <Cell key={item.name} fill={item.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartBlock>

                <ChartBlock title="类别占比" className="xl:col-span-2">
                    <ResponsiveContainer width="100%" height={110}>
                        <PieChart
                            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        >
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={32}
                                outerRadius={49}
                                paddingAngle={2}
                            >
                                {categoryData.map((item) => (
                                    <Cell key={item.name} fill={item.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={chartTooltipStyle}
                                formatter={tooltipFormatter}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <ChartLegend items={categoryData} />
                </ChartBlock>

                <ChartBlock title="处理队列" className="xl:col-span-2">
                    <ResponsiveContainer width="100%" height={110}>
                        <RadialBarChart
                            data={queueData}
                            innerRadius="48%"
                            outerRadius="98%"
                            startAngle={180}
                            endAngle={-180}
                            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        >
                            <RadialBar
                                dataKey="value"
                                background
                                cornerRadius={6}
                            />
                            <Tooltip
                                contentStyle={chartTooltipStyle}
                                formatter={tooltipFormatter}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <QueueLegend
                        processing={data.processingVideoCount}
                        waiting={data.waitingVideoCount}
                    />
                </ChartBlock>
            </div>
        </section>
    );
};

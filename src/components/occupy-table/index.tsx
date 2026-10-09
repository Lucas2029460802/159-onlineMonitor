import { FC } from "react";

interface OccupyTableProps {
    percent: number;
    total: number;
    used: number;
    free: number;
}

const StorageItem: FC<{
    label: string;
    value: string;
    helper?: string;
}> = ({ label, value, helper }) => (
    <div className="flex items-start gap-2 py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
        <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-text-8">{label}</div>
            {helper && (
                <div className="text-xs text-text-6 mt-0.5">{helper}</div>
            )}
        </div>
        <div className="text-sm font-semibold text-text-5 max-w-[50%] text-right break-all">
            {value}
        </div>
    </div>
);

export const OccupyTable: FC<OccupyTableProps> = (props) => {
    const { percent, total, used, free } = props;
    const safePercent = Number.isFinite(percent)
        ? Math.max(0, Math.min(percent, 100))
        : 0;

    return (
        <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 px-3 py-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-text-8">已使用比例</span>
                    <span className="font-mono font-semibold text-text-5">
                        {safePercent.toFixed(2)}%
                    </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white overflow-hidden">
                    <div
                        className="h-full rounded-full bg-blue-1"
                        style={{ width: `${safePercent}%` }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <StorageItem
                    label="总容量"
                    value={`${total.toFixed(2)} GB`}
                    helper="存储池容量"
                />
                <StorageItem
                    label="已使用"
                    value={`${used.toFixed(2)} GB`}
                    helper="视频与索引占用"
                />
                <StorageItem
                    label="余量"
                    value={`${free.toFixed(2)} GB`}
                    helper="当前可用空间"
                />
                <StorageItem
                    label="占用状态"
                    value={safePercent >= 85 ? "偏高" : "正常"}
                    helper={safePercent >= 85 ? "建议清理空间" : "容量充足"}
                />
            </div>
        </div>
    );
};

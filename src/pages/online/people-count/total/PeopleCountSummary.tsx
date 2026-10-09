// src/pages/people-count/components/PeopleCountSummary.tsx
import React from "react";

import { GetPeopleCountSummaryRes } from "@/api/type";

interface PeopleCountSummaryData {
    todayEnter: number;
    todayExit: number;
    currentPeople: number;
    peakPeople: number;
    totalEnter: number;
    totalExit: number;
}

interface PeopleCountSummaryProps {
    data: GetPeopleCountSummaryRes | null;
}

export function pcSDConvert(
    data: GetPeopleCountSummaryRes,
): PeopleCountSummaryData {
    return {
        todayEnter: data.Data.today_in,
        todayExit: data.Data.today_out,
        currentPeople: data.Data.current_people,
        peakPeople: data.Data.history_peak,
        totalEnter: data.Data.total_in,
        totalExit: data.Data.total_out,
    };
}

const PeopleCountSummary: React.FC<PeopleCountSummaryProps> = ({ data }) => {
    const c_data = data ? pcSDConvert(data) : null;
    return (
        <div className="w-[280px] bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                区域汇总数据
            </h3>

            <div className="flex flex-col gap-3">
                <StatRow
                    label="今日进入累计"
                    value={c_data ? c_data.todayEnter : "等待选择监控组"}
                    color="#FF6B00"
                />

                <StatRow
                    label="今日离开累计"
                    value={c_data ? c_data.todayExit : "等待选择监控组"}
                    color="#F5A623"
                />

                <StatRow
                    label="今日当前人数"
                    value={c_data ? c_data.currentPeople : "等待选择监控组"}
                    color="#007AFF"
                />
                <StatRow
                    label="历史峰值人数"
                    value={c_data ? c_data.peakPeople : "等待选择监控组"}
                    color="#8B5CF6"
                />

                <StatRow
                    label="历史总进入"
                    value={c_data ? c_data.totalEnter : "等待选择监控组"}
                    color="#16A34A"
                />
                <StatRow
                    label="历史总离开"
                    value={c_data ? c_data.totalExit : "等待选择监控组"}
                    color="#DC2626"
                />
                <StatRow
                    label="历史净进入"
                    value={
                        c_data
                            ? c_data.totalEnter - c_data.totalExit
                            : "等待选择监控组"
                    }
                    color="#F5A623"
                />
            </div>
        </div>
    );
};

const StatRow = ({
    label,
    value,
    color,
}: {
    label: string;
    value: number | string;
    color: string;
}) => (
    <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-2">
        <span className="text-gray-600 text-sm">{label}</span>
        <span
            className={`${typeof value === "string" ? "text-sm" : "text-xl"} leading-7  font-semibold`}
            style={{ color }}
        >
            {value.toLocaleString()}
        </span>
    </div>
);

export default React.memo(PeopleCountSummary);

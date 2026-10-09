import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

export interface PeopleCountInChart {
    time: string;
    enterCount: number;
    exitCount: number;
}

interface TotalPeopleChartProps {
    data: PeopleCountInChart[] | null;
}

const TotalPeopleChart: React.FC<TotalPeopleChartProps> = ({ data }) => {
    const n = data === null ? [] : data;
    return (
        <div className="w-full h-full bg-white rounded-xl shadow-sm p-4 relative">
            <h3 className="text-lg font-semibold text-gray-700 ">
                区域人流趋势
            </h3>

            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    data={n}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip
                        contentStyle={{
                            border: "1px solid #dcdcdc",
                            borderRadius: "4px",
                            padding: "8px 12px",
                        }}
                        itemStyle={{ fontWeight: 500 }}
                    />
                    <Legend verticalAlign="top" height={24} />
                    <Line
                        type="monotone"
                        dataKey="enterCount"
                        stroke="#FF6B00"
                        name="进入人数"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="exitCount"
                        stroke="#F5A623"
                        name="离开人数"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(TotalPeopleChart);

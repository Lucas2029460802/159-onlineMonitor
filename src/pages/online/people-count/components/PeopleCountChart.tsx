import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface PeopleCountChartProps {
    data: any[];
    xAxisKey: string;
}

const PeopleCountChart = React.memo(
    ({ data, xAxisKey }: PeopleCountChartProps) => {
        return (
            <LineChart
                width={346}
                height={(346 / 16) * 9}
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                    dataKey={xAxisKey}
                    tick={{ fontSize: 13, fill: "#555" }}
                />
                <YAxis tick={{ fontSize: 13, fill: "#555" }} />
                <Tooltip
                    contentStyle={{
                        border: "1px solid #dcdcdc",
                        borderRadius: "4px",
                        padding: "8px 12px",
                    }}
                    itemStyle={{ fontWeight: 500 }}
                />
                <Line
                    type="monotone"
                    dataKey="enterCount"
                    stroke="#FF6B00"
                    name="进入人数"
                />
                <Line
                    type="monotone"
                    dataKey="exitCount"
                    stroke="#F5A623"
                    name="离开人数"
                />
            </LineChart>
        );
    },
);
PeopleCountChart.displayName = "PeopleCountChart";
export default PeopleCountChart;

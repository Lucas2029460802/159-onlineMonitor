import { ConfigProvider, Table, Spin, Button, Tooltip } from "antd";
import zhCN from "antd/locale/zh_CN";
import React, { useEffect, useMemo, useState } from "react";

import { SurveillanceCameraInfo } from "../../types";

import { api } from "@/api";
import { IconReload } from "@/assets/svg";
import { useFetch } from "@/hooks/useFetch";

const requestTableData = async (
    device_ids: string[],
    channel_ids: string[],
    timeStamp: number,
) => {
    return api.online.tableData(device_ids, channel_ids);
};

interface PcTableProps {
    cardSvIds: (string | null)[];
    svInfo: SurveillanceCameraInfo[];
    curViewMode: "visual" | "table";
}

interface TableRow {
    key: string;
    name: string;
    group: string;
    hourIn: number;
    hourOut: number;
    weekIn: number;
    weekOut: number;
    monthIn: number;
    monthOut: number;
    totalIn: number;
    totalOut: number;
}

const PcTable = React.memo(
    ({ cardSvIds, svInfo, curViewMode }: PcTableProps) => {
        // 过滤掉 null
        const trueSvIds = cardSvIds.filter((id): id is string => id !== null);

        // 获取对应的设备和通道ID
        const channel_ids = trueSvIds.map(
            (id) => svInfo.find((sv) => sv.svId === id)!.channel_id,
        );
        const device_ids = trueSvIds.map(
            (id) => svInfo.find((sv) => sv.svId === id)!.device_id,
        );

        // 请求后端数据
        const [timeStamp, setTimeStamp] = useState(0);
        const { loading, data } = useFetch(
            false,
            requestTableData,
            device_ids,
            channel_ids,
            timeStamp,
        );

        // 构建表格数据
        const tableData: TableRow[] = useMemo(() => {
            const resData = data?.Data ?? [];

            // 遍历监控列表
            const rows = trueSvIds.map((id) => {
                const info = svInfo.find((sv) => sv.svId === id)!;
                const match = resData.find(
                    (d) =>
                        d.device_id === info.device_id &&
                        d.channel_id === info.channel_id,
                );

                return {
                    key: info.svId,
                    name: info.name,
                    group: info.groups[0] || "-",
                    hourIn: match?.last_hour_in ?? 0,
                    hourOut: match?.last_hour_out ?? 0,
                    weekIn: match?.last_day_in ?? 0, // 如果后端未来支持 week，可替换字段
                    weekOut: match?.last_day_out ?? 0,
                    monthIn: match?.last_month_in ?? 0,
                    monthOut: match?.last_month_out ?? 0,
                    totalIn: match?.all_in ?? 0,
                    totalOut: match?.all_out ?? 0,
                };
            });

            if (rows.length === 0) return [];

            // 汇总行
            const totalRow: TableRow = {
                key: "total",
                name: "总计",
                group: "-",
                hourIn: rows.reduce((sum, r) => sum + r.hourIn, 0),
                hourOut: rows.reduce((sum, r) => sum + r.hourOut, 0),
                weekIn: rows.reduce((sum, r) => sum + r.weekIn, 0),
                weekOut: rows.reduce((sum, r) => sum + r.weekOut, 0),
                monthIn: rows.reduce((sum, r) => sum + r.monthIn, 0),
                monthOut: rows.reduce((sum, r) => sum + r.monthOut, 0),
                totalIn: rows.reduce((sum, r) => sum + r.totalIn, 0),
                totalOut: rows.reduce((sum, r) => sum + r.totalOut, 0),
            };

            return [...rows, totalRow];
        }, [data, svInfo, trueSvIds]);

        const handleRefresh = () => {
            setTimeStamp((prev) => prev + 1); // 触发重新请求
        };
        useEffect(() => {
            if (curViewMode === "table") {
                handleRefresh();
            }
        }, [curViewMode]);

        const columns = [
            {
                title: (
                    <div className="flex items-center gap-2">
                        <span>监控名字</span>
                        <Button
                            type="text"
                            size="small"
                            icon={
                                <Tooltip title="刷新数据">
                                    <IconReload />
                                </Tooltip>
                            }
                            onClick={handleRefresh}
                            loading={loading}
                        />
                    </div>
                ),
                dataIndex: "name",
                key: "name",
            },
            { title: "所属组别", dataIndex: "group", key: "group" },
            { title: "近1小时进入", dataIndex: "hourIn", key: "hourIn" },
            { title: "近1小时离开", dataIndex: "hourOut", key: "hourOut" },
            { title: "近1天进入", dataIndex: "weekIn", key: "weekIn" },
            { title: "近1天离开", dataIndex: "weekOut", key: "weekOut" },
            { title: "近1月进入", dataIndex: "monthIn", key: "monthIn" },
            { title: "近1月离开", dataIndex: "monthOut", key: "monthOut" },
            { title: "历史总进入", dataIndex: "totalIn", key: "totalIn" },
            { title: "历史总离开", dataIndex: "totalOut", key: "totalOut" },
        ];

        return (
            <div className="w-full overflow-x-scroll pt-4">
                <ConfigProvider locale={zhCN}>
                    <Spin spinning={loading}>
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            pagination={false}
                            scroll={{ x: window.screen.width - 380 - 50 }}
                            bordered
                            size="middle"
                        />
                    </Spin>
                </ConfigProvider>
            </div>
        );
    },
);

PcTable.displayName = "PcTable";
export default PcTable;

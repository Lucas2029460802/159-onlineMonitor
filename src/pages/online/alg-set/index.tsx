import { message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { STRATEGYID } from "../types";
import { PhaseOne } from "./components/PhaseOne";

import { api } from "@/api";
import { AllSvRes, oneSv } from "@/api/type";
import { PageLoading } from "@/components/page-loading";

export type ModeType = "BATCH" | "SINGLE" | "SEARCH";

export interface SubTask {
    id: number;
    mode: ModeType;
    monitorIds: number[];
    algorithmIds: number[];
    params?: any;
}

export interface DeploymentData {
    groupName: string;
    groupMonitorIds: number[];
    subTasks: SubTask[];
}

export default function AlgSet() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [allMonitors, setAllMonitors] = useState<oneSv[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                await api.online.refreshWhitelist();
                const res: AllSvRes = await api.online.getAllSv(true);
                setAllMonitors(res.Data);
            } catch (e) {
                message.error("刷新可布控通道失败，请重试");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /** 校验通过后直接按「实时监测」提交布控，不再进入第二阶段 */
    const handleCreateGroup = async (data: {
        groupName: string;
        groupMonitorIds: number[];
    }) => {
        const subTask: SubTask = {
            id: Date.now(),
            mode: "SEARCH",
            monitorIds: [...data.groupMonitorIds],
            algorithmIds: [STRATEGYID.SEARCH],
        };
        const submitPayload: DeploymentData & { timestamp: string } = {
            groupName: data.groupName,
            groupMonitorIds: data.groupMonitorIds,
            subTasks: [subTask],
            timestamp: new Date().toISOString(),
        };

        setSubmitting(true);
        try {
            message.info("正在提交布控数据...");
            await api.online.algSetGroup(submitPayload);
            message.success(
                `已成功为「${data.groupName}」创建实时监测布控（${data.groupMonitorIds.length} 路监控）`,
            );
            navigate("/online/surveillance-manage");
        } catch (e) {
            // axios 拦截器已提示错误
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full bg-[#f4f7f9] flex flex-col overflow-hidden">
            <main className="flex-1 min-h-0 overflow-hidden">
                {loading ? (
                    <PageLoading
                        title="正在同步通道"
                        description="刷新可布控监控列表"
                    />
                ) : (
                    <PhaseOne
                        allMonitors={allMonitors}
                        submitting={submitting}
                        onSubmit={handleCreateGroup}
                    />
                )}
            </main>
        </div>
    );
}

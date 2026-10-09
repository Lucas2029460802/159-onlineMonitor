import { UserOutlined, FireOutlined } from "@ant-design/icons";
import { Modal, message } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { strategyMap, svStrategy } from "../types";
import { PhaseOne } from "./components/PhaseOne";
import { PhaseTwo } from "./components/PhaseTwo";

import { api } from "@/api";
import { AllSvRes, oneSv } from "@/api/type";

// --- 类型定义 (根据你的需求) ---
export type ModeType = "BATCH" | "SINGLE" | "SEARCH";
// 算法类型定义
export type AlgoType = "NORMAL" | "SPECIAL";

export interface Algorithm {
    id: number;
    name: string;
    type: AlgoType;
    icon: React.ReactNode;
}

// 子布控任务结构
export interface SubTask {
    id: number;
    mode: ModeType;
    monitorIds: number[]; // 选中的监控ID
    algorithmIds: number[]; // 选中的算法ID
    params?: any; // 特殊参数
}

// 整体表单数据结构
export interface DeploymentData {
    groupName: string;
    groupMonitorIds: number[]; // 第一阶段选中的所有监控
    subTasks: SubTask[]; // 第二阶段生成的子任务
}

export const SpecialAlgoArr: svStrategy[] = ["人流监测"];

export const ALGORITHMS: Algorithm[] = Object.entries(strategyMap).map(
    (item) => ({
        id: Number(item[0]),
        name: item[1],
        type: SpecialAlgoArr.includes(item[1]) ? "SPECIAL" : "NORMAL",
        icon: item[1] === "明火可见" ? <FireOutlined /> : <UserOutlined />,
    }),
);
ALGORITHMS.pop();

export default function AlgSet() {
    const [loading, setLoading] = useState(true);
    const [allMonitors, setAllMonitors] = useState<oneSv[]>([]);

    // 流程状态
    const [currentStep, setCurrentStep] = useState<number>(0);

    // 数据状态
    const [deploymentData, setDeploymentData] = useState<DeploymentData>({
        groupName: "",
        groupMonitorIds: [],
        subTasks: [],
    });

    // 加载数据
    useEffect(() => {
        const load = async () => {
            try {
                const res: AllSvRes = await api.online.getAllSv();
                setAllMonitors(res.Data);
            } catch (e) {
                message.error("加载监控列表失败");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const navigate = useNavigate();
    // 提交最终数据
    const handleFinalSubmit = async () => {
        const submitPayload = {
            ...deploymentData,
            timestamp: new Date().toISOString(),
        };
        console.log("提交给后端的数据:", submitPayload);
        try {
            message.info("正在提交布控数据...");
            await api.online.algSetGroup(submitPayload);
            message.success(
                `已成功为 "${deploymentData.groupName}" 创建了 ${deploymentData.subTasks.length} 个布控任务。`,
            );
            navigate("/online/surveillance-manage");
        } catch (e) {
            // message.warning(`提交失败，${e}`); axios本身会catch，这里不需要再catch了
        }
    };

    return (
        <div className="w-full h-full bg-[#f3f4f6] flex flex-col overflow-hidden">
            <main className="flex-1 overflow-hidden p-4">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
                        <div>加载监控数据中...</div>
                    </div>
                ) : (
                    <>
                        {currentStep === 0 && (
                            <PhaseOne
                                initialData={deploymentData}
                                allMonitors={allMonitors}
                                onNext={(data) => {
                                    setDeploymentData((prev) => ({
                                        ...prev,
                                        ...data,
                                    }));
                                    setCurrentStep(1);
                                }}
                            />
                        )}

                        {currentStep === 1 && (
                            <PhaseTwo
                                deploymentData={deploymentData}
                                allMonitors={allMonitors}
                                onBack={() => setCurrentStep(0)}
                                onUpdateSubTasks={(tasks) => {
                                    setDeploymentData((prev) => ({
                                        ...prev,
                                        subTasks: tasks,
                                    }));
                                }}
                                onSubmit={handleFinalSubmit}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

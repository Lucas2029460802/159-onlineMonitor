// --- 子组件: 第二阶段 (核心布局) ---

import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    SettingOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Empty,
    List,
    message,
    Radio,
    Select,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import { Algorithm, ALGORITHMS, DeploymentData, ModeType, SubTask } from "..";
import DrawPopupVideoVersion, { FlowLine } from "./PcParamPopup_VideoVersion";
import PreviewWebRTCPlayer from "./PreviewWebrtcPlayer";
import { STRATEGYID } from "../../types";
import { convertFlowlineToNumberArr } from "../../util";

import { api } from "@/api";
import { oneSv } from "@/api/type";

export const PhaseTwo = ({
    deploymentData,
    allMonitors,
    onBack,
    onUpdateSubTasks,
    onSubmit,
}: {
    deploymentData: DeploymentData;
    allMonitors: oneSv[];
    onBack: () => void;
    onUpdateSubTasks: (tasks: SubTask[]) => void;
    onSubmit: () => void;
}) => {
    // 状态：当前表单设置
    const [mode, setMode] = useState<ModeType>("BATCH");
    const [selectedMonitorIds, setSelectedMonitorIds] = useState<number[]>([]);
    const [selectedAlgoIds, setSelectedAlgoIds] = useState<number[]>([]);

    // 状态：预览与弹窗
    const [activePreviewId, setActivePreviewId] = useState<number | null>(null);
    const [isParamModalOpen, setIsParamModalOpen] = useState(false);

    // 过滤出第一阶段选中的监控对象
    const groupMonitors = useMemo(() => {
        return allMonitors.filter((m) =>
            deploymentData.groupMonitorIds.includes(m.Id),
        );
    }, [allMonitors, deploymentData.groupMonitorIds]);

    // 动态计算当前可选的算法（根据模式）
    const availableAlgos: Algorithm[] = useMemo(() => {
        if (mode === "SEARCH")
            return ALGORITHMS.filter((a) => a.id === STRATEGYID.SEARCH); // 只返回在线监测算法
        const withSearch = ALGORITHMS.filter((a) =>
            mode === "BATCH" ? a.type === "NORMAL" : a.type === "SPECIAL",
        );
        return withSearch.filter((a) => a.id !== STRATEGYID.SEARCH);
    }, [mode]);

    // 当选中的监控变化时，默认预览第一个
    useEffect(() => {
        if (selectedMonitorIds.length > 0) {
            // 如果当前预览的不在选中列表里，切到第一个选中的
            if (!selectedMonitorIds.includes(activePreviewId || -1)) {
                setActivePreviewId(selectedMonitorIds[0]);
            }
        } else {
            setActivePreviewId(null);
        }
    }, [selectedMonitorIds, activePreviewId]);

    // --- 处理函数 ---

    const handleAddSubTask = (params?: any) => {
        if (selectedMonitorIds.length === 0) {
            message.error("请选择监控");
            return;
        }
        if (selectedAlgoIds.length === 0) {
            message.error("请选择算法");
            return;
        }

        const newTask: SubTask = {
            id: Date.now(),
            mode,
            monitorIds: [...selectedMonitorIds],
            algorithmIds: [...selectedAlgoIds],
            params,
        };

        onUpdateSubTasks([...deploymentData.subTasks, newTask]);

        // 重置选择监控
        setSelectedMonitorIds([]);
        // 重置选择的算法
        if (mode === "SEARCH") {
            setSelectedAlgoIds([STRATEGYID.SEARCH]);
        } else {
            setSelectedAlgoIds([]);
        }
        message.success("已添加到布控列表");
    };

    const handleConfigClick = () => {
        if (selectedMonitorIds.length === 0 || selectedAlgoIds.length === 0) {
            message.warning("请先选择监控和算法");
            return;
        }
        setIsParamModalOpen(true);
    };

    const handleDeleteTask = (taskId: number) => {
        const newTasks = deploymentData.subTasks.filter((t) => t.id !== taskId);
        onUpdateSubTasks(newTasks);
    };

    // 获取当前预览监控的详细信息
    const currentPreviewMonitor = groupMonitors.find(
        (m) => m.Id === activePreviewId,
    );

    // 视频播放源
    const videoRef = useRef<HTMLVideoElement>(null);
    // 请求webtrc源
    const [webrtcSrc, setWebRtcSrc] = useState<string>("");
    useEffect(() => {
        const load = async () => {
            if (!currentPreviewMonitor) return;
            try {
                const res = await api.online.getWebRtc(
                    currentPreviewMonitor.parent_id,
                    currentPreviewMonitor.device_id,
                );
                setWebRtcSrc(res.Data);
            } catch (e) {
                setWebRtcSrc("");
            }
        };
        load();
    }, [currentPreviewMonitor]);
    // 参数提交回调
    //  Popup 内绘制完成的回调
    const handleDrawComplete = async (
        success: boolean,
        line1: FlowLine | null,
        line2: FlowLine | null,
        line3: FlowLine | null,
        line4: FlowLine | null,
    ) => {
        // 关闭popup时没有成功，那就取消打开
        if (!success) {
            setIsParamModalOpen(false);
            return;
        }
        // 成功时提交到列表
        setIsParamModalOpen(false);
        const newTask: SubTask = {
            id: Date.now(),
            mode,
            monitorIds: [...selectedMonitorIds],
            algorithmIds: [...selectedAlgoIds],
            params: {
                line_points_entrance: [
                    convertFlowlineToNumberArr(line1!),
                    convertFlowlineToNumberArr(line2!),
                    convertFlowlineToNumberArr(line3!),
                ],
                line_points_direction_in2out: convertFlowlineToNumberArr(
                    line4!,
                ),
            },
        };

        onUpdateSubTasks([...deploymentData.subTasks, newTask]);

        // 重置表单
        setSelectedMonitorIds([]);
        setSelectedAlgoIds([]);
        message.success("已添加到布控列表");
    };
    return (
        <div className="flex flex-col h-full">
            {/* 顶部导航栏 */}
            <div className="flex items-center justify-between mb-4 px-2">
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                    返回修改监控组
                </Button>
                <Typography.Title level={4} className="!m-0">
                    组：{deploymentData.groupName} (已选择{groupMonitors.length}
                    个监控资源)
                </Typography.Title>
                <div className="w-[100px]"></div>
            </div>
            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* 左侧：视频预览区 (60%) */}
                <div className="flex-[3] flex flex-col bg-black rounded-lg overflow-hidden relative">
                    {/* 主画面 (16:9 容器) */}
                    <div className="flex-1 relative w-full bg-[#101828] flex items-center justify-center">
                        {currentPreviewMonitor ? (
                            <div className="relative w-full object-fit">
                                {/* 模拟视频画面 */}
                                <PreviewWebRTCPlayer
                                    videoRef={videoRef}
                                    url={webrtcSrc}
                                />

                                {/* <div className=" bottom-2 left-2 text-white bg-black/50 px-2 rounded">
                                    {currentPreviewMonitor.name}
                                </div> */}
                            </div>
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <VideoCameraOutlined style={{ fontSize: 48 }} />
                                <p className="mt-2">请在右侧选择监控以预览</p>
                            </div>
                        )}
                    </div>

                    {/* 底部：滚动网格条 */}
                    <div className="h-24 bg-[#1e2939] border-t border-[#364153] overflow-x-auto whitespace-nowrap p-2 flex gap-2">
                        {selectedMonitorIds.length > 0 ? (
                            selectedMonitorIds.map((id) => {
                                const m = groupMonitors.find(
                                    (mon) => mon.Id === id,
                                );
                                if (!m) return null;
                                const isActive = activePreviewId === id;
                                return (
                                    <div
                                        key={id}
                                        onClick={() => setActivePreviewId(id)}
                                        className={`inline-block h-full aspect-video bg-[#364153] cursor-pointer relative rounded overflow-hidden
                                                    ${isActive ? "ring-2 ring-[#2b7fff]" : "opacity-70 hover:opacity-100"}
                                                `}
                                    >
                                        <img
                                            src={`/api/video/image?image_path=${m.view_path}`}
                                            className="w-full h-full object-cover"
                                            alt="thumb"
                                        />
                                        <span className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] px-1 truncate">
                                            {m.name}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-gray-500 text-sm w-full flex items-center justify-center">
                                暂无选中监控
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧：设置与列表区 (40%) */}
                <div className="flex-[2] flex flex-col gap-4 overflow-hidden">
                    {/* 上半部分：新建子布控 */}
                    <Card
                        title="添加算法布控"
                        className="shadow-sm flex-shrink-0"
                    >
                        <div className="space-y-4">
                            {/* 1. 模式选择 */}
                            <div>
                                <div className="text-gray-500 text-xs mb-1">
                                    布控模式
                                </div>
                                <Radio.Group
                                    value={mode}
                                    onChange={(e) => {
                                        setMode(e.target.value);
                                        setSelectedMonitorIds([]);
                                        setSelectedAlgoIds([]);
                                        if (e.target.value === "SEARCH") {
                                            setSelectedAlgoIds([
                                                STRATEGYID.SEARCH,
                                            ]);
                                        }
                                    }}
                                    buttonStyle="solid"
                                    className="w-full flex"
                                >
                                    <Radio.Button
                                        value="BATCH"
                                        className="flex-1 text-center"
                                    >
                                        批量布控 (无参数)
                                    </Radio.Button>
                                    <Radio.Button
                                        value="SINGLE"
                                        className="flex-1 text-center"
                                    >
                                        特殊布控 (有参数)
                                    </Radio.Button>
                                    <Radio.Button
                                        value="SEARCH"
                                        className="flex-1 text-center"
                                    >
                                        实时监测 (人车检测)
                                    </Radio.Button>
                                </Radio.Group>
                            </div>

                            {/* 2. 目标监控选择 */}
                            <div>
                                <div className="text-gray-500 text-xs mb-1">
                                    选择监控 (
                                    {mode === "SINGLE" ? "单选" : "多选"})
                                </div>
                                <Select
                                    placeholder="从已选组中挑选监控"
                                    mode={
                                        mode === "SINGLE"
                                            ? undefined
                                            : "multiple"
                                    }
                                    value={
                                        mode === "SINGLE"
                                            ? selectedMonitorIds[0]
                                            : selectedMonitorIds
                                    }
                                    onChange={(val) => {
                                        if (
                                            mode === "BATCH" ||
                                            mode === "SEARCH"
                                        ) {
                                            setSelectedMonitorIds(
                                                val as number[],
                                            );
                                        } else {
                                            setSelectedMonitorIds(
                                                val ? [val as number] : [],
                                            );
                                        }
                                    }}
                                    options={groupMonitors.map((m) => ({
                                        label: m.name,
                                        value: m.Id,
                                    }))}
                                    className="w-full"
                                    status={
                                        selectedMonitorIds.length === 0
                                            ? "warning"
                                            : ""
                                    }
                                />
                            </div>

                            {/* 3. 算法选择 */}
                            <div>
                                <div className="text-gray-500 text-xs mb-1">
                                    选择算法 (
                                    {mode === "BATCH" ? "多选" : "单选"})
                                </div>
                                <Select
                                    disabled={mode === "SEARCH"}
                                    placeholder={
                                        mode === "BATCH"
                                            ? "选择普通算法"
                                            : "选择特殊算法"
                                    }
                                    mode={
                                        mode === "BATCH"
                                            ? "multiple"
                                            : undefined
                                    }
                                    value={
                                        mode === "BATCH"
                                            ? selectedAlgoIds
                                            : selectedAlgoIds[0]
                                    }
                                    onChange={(val) => {
                                        if (mode === "BATCH") {
                                            setSelectedAlgoIds(val as number[]);
                                        } else {
                                            setSelectedAlgoIds([val as number]);
                                        }
                                    }}
                                    className="w-full"
                                    status={
                                        selectedAlgoIds.length === 0
                                            ? "warning"
                                            : ""
                                    }
                                >
                                    {availableAlgos.map((algo) => {
                                        console.log(mode, selectedAlgoIds);
                                        return (
                                            <Select.Option
                                                key={algo.id}
                                                value={algo.id}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {algo.icon} {algo.name}
                                                </div>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </div>

                            {/* 4. 动作按钮 */}
                            <Button
                                type="primary"
                                block
                                icon={
                                    mode === "SINGLE" ? (
                                        <SettingOutlined />
                                    ) : (
                                        <CheckCircleOutlined />
                                    )
                                }
                                onClick={
                                    mode === "SINGLE"
                                        ? handleConfigClick
                                        : () => handleAddSubTask()
                                }
                            >
                                {mode === "SINGLE"
                                    ? "设置参数并添加"
                                    : "完成设置 (添加到列表)"}
                            </Button>
                        </div>
                    </Card>

                    {/* 下半部分：已添加列表 */}
                    <div className="flex-1 bg-white rounded-lg border border-[#e5e7eb] flex flex-col overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-[#f3f4f6] bg-gray-50 flex justify-between items-center">
                            <span className="font-medium">
                                已添加的子布控 ({deploymentData.subTasks.length}
                                )
                            </span>
                            <Button
                                type="link"
                                size="small"
                                danger
                                disabled={deploymentData.subTasks.length === 0}
                                onClick={() => onUpdateSubTasks([])}
                            >
                                清空
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {deploymentData.subTasks.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="暂无布控任务"
                                />
                            ) : (
                                <List
                                    dataSource={deploymentData.subTasks}
                                    renderItem={(item) => {
                                        const monitorNames = item.monitorIds
                                            .map(
                                                (id) =>
                                                    allMonitors.find(
                                                        (m) => m.Id === id,
                                                    )?.name,
                                            )
                                            .join("，");

                                        const isBatch = item.mode === "BATCH";

                                        return (
                                            <List.Item
                                                key={item.id}
                                                className="bg-gray-50 rounded border border-[#f3f4f6] px-3 py-2 mb-2"
                                                actions={[
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={
                                                            <DeleteOutlined />
                                                        }
                                                        size="small"
                                                        key="delete"
                                                        onClick={() =>
                                                            handleDeleteTask(
                                                                item.id,
                                                            )
                                                        }
                                                    />,
                                                ]}
                                            >
                                                <div className="flex flex-col w-full gap-1">
                                                    {/* Header Row */}
                                                    <div className="flex items-center gap-2">
                                                        <Tag
                                                            color={
                                                                isBatch
                                                                    ? "blue"
                                                                    : "orange"
                                                            }
                                                        >
                                                            {isBatch
                                                                ? "批量"
                                                                : "特殊"}
                                                        </Tag>

                                                        <Tooltip
                                                            title={monitorNames}
                                                        >
                                                            <span className="text-sm font-bold">
                                                                {
                                                                    item
                                                                        .monitorIds
                                                                        .length
                                                                }{" "}
                                                                个监控
                                                            </span>
                                                        </Tooltip>
                                                    </div>

                                                    {/* Algorithm Tags */}
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {item.algorithmIds.map(
                                                            (aid) => {
                                                                const algo =
                                                                    ALGORITHMS.find(
                                                                        (a) =>
                                                                            a.id ===
                                                                            aid,
                                                                    );
                                                                return (
                                                                    <Tag
                                                                        key={
                                                                            aid
                                                                        }
                                                                        icon={
                                                                            algo?.icon
                                                                        }
                                                                    >
                                                                        {
                                                                            algo?.name
                                                                        }
                                                                    </Tag>
                                                                );
                                                            },
                                                        )}

                                                        {item.mode ===
                                                            "SINGLE" && (
                                                            <Tag color="green">
                                                                已设参数
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            </List.Item>
                                        );
                                    }}
                                />
                            )}
                        </div>

                        {/* 底部确认区域 */}
                        <div className="p-3 border-t border-[#e5e7eb] bg-gray-50">
                            <Button
                                type="primary"
                                className="w-full h-10 bg-green-600 hover:bg-green-500 border-green-600"
                                disabled={deploymentData.subTasks.length === 0}
                                onClick={onSubmit}
                            >
                                确认提交所有布控
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <DrawPopupVideoVersion
                videoRef={videoRef}
                onClose={(success, line1, line2, line3, line4) =>
                    handleDrawComplete(success, line1, line2, line3, line4)
                }
                showPopup={isParamModalOpen}
            />
        </div>
    );
};

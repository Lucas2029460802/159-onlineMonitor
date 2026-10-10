import { useEffect, useRef, useState } from "react";

import { SurveillanceCameraInfo, svStrategy } from "../types";
import { convertCertainSvInfo2SvInfo, mapStrategyName2Id } from "../util";
import BatchManage from "./components/batchManage";
import DeleteGroup from "./components/deleteGroup";
import LifecycleBar, { LifecycleNote } from "./components/lifecycleBar";
import SvCard from "./components/svCard";
import {
    applyChannelLifecycle,
    channelActionMessage,
    needsLifecyclePoll,
    normalizeChannelResult,
    readLifecyclePayload,
} from "./lifecycle";

import { api } from "@/api";
import { GroupInfo } from "@/api/type";
import { IconClose } from "@/assets/svg";
import GenreTab, { TabItem } from "@/components/genre-tab";
import { PageLoading } from "@/components/page-loading";
import { Pagination } from "@/components/pagination";
import { Popup } from "@/components/popup";
import NotExist from "@/pages/video-player/assets/not-exist.svg?react";
import { Message } from "@/util/ui";

const fetchGroups = async (): Promise<GroupInfo[]> => {
    const res = await api.online.getAllGroups();
    return res.Data;
};

const toTabs = (groupRes: GroupInfo[]): TabItem[] =>
    groupRes.map((item) => ({
        key: item.Id.toString(),
        label: item.Name,
        count: item.Num,
        offset: 10,
    }));

type LifecycleConfirm = {
    action: "暂停" | "恢复";
    id: number;
    name: string;
};

// 模拟请求函数
const fetchGroupData = async (
    groupKey: string,
    page: number,
    size: number,
): Promise<SurveillanceCameraInfo[]> => {
    const res = await api.online.getCertainGroups(groupKey, page, size);
    const v = res.Data.map(convertCertainSvInfo2SvInfo);
    return v;
};

export default function SurveillanceManage() {
    const PERPAGE = 20; // 每页监控数量
    const [curPage, setCurPage] = useState(0);
    const [total, setTotal] = useState(1);

    const [loading, setLoading] = useState(true);
    const [curKey, setCurKey] = useState<string>("");
    const [curSvGroup, setCurSvGroup] = useState<SurveillanceCameraInfo[]>([]);

    const [groups, setGroups] = useState<GroupInfo[]>([]);
    const [refreshTS, setRefreshTS] = useState(0); // 用于删除组别之后的重新刷新请求
    const [listVersion, setListVersion] = useState(0);
    const [confirm, setConfirm] = useState<LifecycleConfirm | null>(null);
    const [acting, setActing] = useState(false);
    const cardsRef = useRef<SurveillanceCameraInfo[]>([]);
    const groupsRef = useRef<GroupInfo[]>([]);
    // 初始化：先请求 groups，再请求默认组的视频
    useEffect(() => {
        const loadGroups = async () => {
            setLoading(true);
            const groupRes = await fetchGroups();
            setGroups(groupRes);
            const defaultKey = groupRes[0] ? String(groupRes[0].Id) : "";
            setCurKey(defaultKey);
            const totalNum =
                groupRes.find((item) => String(item.Id) === defaultKey)?.Num ??
                0;
            setTotal(totalNum);
            const data = totalNum
                ? await fetchGroupData(defaultKey, 0, PERPAGE)
                : [];
            setCurSvGroup(data);
            setListVersion((prev) => prev + 1);
            setLoading(false);
        };
        loadGroups();
    }, [refreshTS]);

    // 切换 tab
    useEffect(() => {
        if (!curKey) return;
        const loadGroupData = async (key: string) => {
            setLoading(true);
            const data = await fetchGroupData(key, 0, PERPAGE);
            setCurSvGroup(data);
            setListVersion((prev) => prev + 1);
            setLoading(false);
        };
        loadGroupData(curKey);
        setTotal(
            groupsRef.current.find((item) => String(item.Id) === curKey)?.Num ??
                1,
        );
    }, [curKey]);

    // 批量算法管理
    const batchManageAddAlg = async (svIds: string[], algs: svStrategy[]) => {
        try {
            await api.online.addStrategies(
                svIds.map((i) => Number(i)),
                algs.map((i) => mapStrategyName2Id(i)),
            );
            setCurSvGroup((prev) =>
                prev.map((item) => {
                    if (!svIds.includes(item.svId)) return item;
                    const newAlgs = Array.from(
                        new Set([...item.appliedStrategies, ...algs]),
                    );
                    return { ...item, appliedStrategies: newAlgs };
                }),
            );
            Message.success("a", `为${svIds.length}个监控添加算法成功`);
        } catch (e) {
            Message.warning("a", `添加算法失败，${e}`);
        }
    };

    const batchManageRemoveAlg = async (
        svIds: string[],
        algs: svStrategy[],
    ) => {
        try {
            await api.online.delStrategies(
                svIds.map((i) => Number(i)),
                algs.map((i) => mapStrategyName2Id(i)),
            );
            setCurSvGroup((prev) =>
                prev.map((item) => {
                    if (!svIds.includes(item.svId)) return item;
                    const newAlgs = item.appliedStrategies.filter(
                        (a) => !algs.includes(a),
                    );
                    return { ...item, appliedStrategies: newAlgs };
                }),
            );
            Message.success("a", `为${svIds.length}个监控移除算法成功`);
        } catch (e) {
            Message.warning("a", `移除算法失败，${e}`);
        }
    };

    cardsRef.current = curSvGroup;
    groupsRef.current = groups;
    const currentGroup = groups.find((item) => String(item.Id) === curKey);
    const tabs = toTabs(groups);
    const pollKey = curSvGroup
        .filter((item) => needsLifecyclePoll(item.lifecycleStatus))
        .map((item) => item.svId)
        .sort()
        .join(",");

    useEffect(() => {
        let cancelled = false;
        const paused = cardsRef.current.filter(
            (item) => item.channelState === "paused" && !item.lifecycleStatus,
        );
        if (paused.length === 0) return;
        void (async () => {
            const results = await Promise.all(
                paused.map(async (item) => {
                    try {
                        const res = await api.online.getChannelState(
                            Number(item.svId),
                            true,
                        );
                        return normalizeChannelResult(res.Data);
                    } catch (err) {
                        return readLifecyclePayload(err).data;
                    }
                }),
            );
            if (cancelled) return;
            setCurSvGroup((prev) =>
                results.reduce(
                    (list, result) =>
                        result ? applyChannelLifecycle(list, result) : list,
                    prev,
                ),
            );
        })();
        return () => {
            cancelled = true;
        };
    }, [listVersion]);

    useEffect(() => {
        if (!pollKey) return;
        let cancelled = false;
        const ids = pollKey.split(",");
        const tick = async () => {
            const results = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const res = await api.online.getChannelState(
                            Number(id),
                            true,
                        );
                        return normalizeChannelResult(res.Data);
                    } catch (err) {
                        return readLifecyclePayload(err).data;
                    }
                }),
            );
            if (cancelled) return;
            setCurSvGroup((prev) =>
                results.reduce(
                    (list, result) =>
                        result ? applyChannelLifecycle(list, result) : list,
                    prev,
                ),
            );
        };
        const timer = window.setInterval(() => {
            void tick();
        }, 3000);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [pollKey]);

    const refreshGroupMeta = async () => {
        const groupRes = await fetchGroups();
        setGroups(groupRes);
        setTotal(groupRes.find((item) => String(item.Id) === curKey)?.Num ?? 0);
    };

    const submitLifecycle = async () => {
        if (!confirm || acting) return;
        setActing(true);
        try {
            const res =
                confirm.action === "暂停"
                    ? await api.online.pauseChannel(confirm.id)
                    : await api.online.resumeChannel(confirm.id);
            const result = normalizeChannelResult(res.Data);
            if (result) {
                setCurSvGroup((prev) => applyChannelLifecycle(prev, result));
            }
            Message.success(
                "lifecycle",
                channelActionMessage(confirm.action, result, res.Message),
            );
            await refreshGroupMeta();
            setConfirm(null);
        } catch (err) {
            const payload = readLifecyclePayload(err);
            if (payload.data) {
                setCurSvGroup((prev) =>
                    applyChannelLifecycle(prev, payload.data!),
                );
            }
        } finally {
            setActing(false);
        }
    };

    return (
        <div className="h-full w-full px-15 pt-6 flex flex-col">
            {/* 顶部分组标签 */}
            <GenreTab
                tabs={tabs}
                defaultActiveKey={curKey}
                onChange={(key) => setCurKey(key)}
            />
            {/* 分割线 */}
            <div className="border-b border-solid border-gray-1 mb-5"></div>
            {/* 批量管理区 */}
            <div className="flex flex-wrap gap-4 items-start">
                <BatchManage
                    curSvInfos={curSvGroup}
                    batchManageAddAlg={batchManageAddAlg}
                    batchManageRemoveAlg={batchManageRemoveAlg}
                />
                <LifecycleBar group={currentGroup} />
                <DeleteGroup
                    onFinish={async () => {
                        setRefreshTS((prev) => prev + 1);
                    }}
                    groupId={Number(curKey)}
                ></DeleteGroup>
            </div>
            <LifecycleNote />
            {loading && (
                <PageLoading
                    title="监控加载中"
                    description="正在获取当前分组的监控"
                    className="flex-1 h-auto min-h-[280px]"
                />
            )}
            {/* 无监控 */}
            {!loading && curSvGroup.length === 0 && (
                <div className="h-full w-full flex items-center justify-center  relative ">
                    <span className="w-20 h-20">
                        <NotExist />
                    </span>
                    <span className="ml-4 text-2xl text-[#cdcdcd] ">
                        暂无视频
                    </span>
                </div>
            )}
            {/* 监控卡片 */}
            {!loading && curSvGroup.length > 0 && (
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-5 content-start flex-1 overflow-y-scroll">
                    {curSvGroup.map((item) => (
                        <SvCard
                            key={item.svId}
                            svCamInfo={item}
                            onPause={() => {
                                setConfirm({
                                    action: "暂停",
                                    id: Number(item.svId),
                                    name: item.name,
                                });
                            }}
                            onResume={() => {
                                setConfirm({
                                    action: "恢复",
                                    id: Number(item.svId),
                                    name: item.name,
                                });
                            }}
                        />
                    ))}
                </div>
            )}
            {/* 分页 */}
            <div className="pt-8 w-full flex items-center justify-center">
                <Pagination
                    total={Math.ceil(total / PERPAGE)}
                    defaultValue={1}
                    onChange={async (newPage) => {
                        const page = newPage - 1;
                        if (page === curPage) return;
                        setCurPage(page);
                        setLoading(true);
                        const data = await fetchGroupData(
                            curKey,
                            page,
                            PERPAGE,
                        );
                        setCurSvGroup(data);
                        setListVersion((prev) => prev + 1);
                        setLoading(false);
                    }}
                />
            </div>
            <Popup
                show={confirm !== null}
                className="w-[560px] bg-white border-0 rounded-lg"
            >
                <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between">
                    <div className="text-blue-2">通道{confirm?.action}</div>
                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer"
                        onClick={() => {
                            if (!acting) setConfirm(null);
                        }}
                    />
                </div>
                <div className="p-8 flex flex-col gap-4 text-sm text-[#61666d] leading-6">
                    <div className="text-base text-[#18191c]">
                        {confirm?.name}
                    </div>
                    {confirm?.action === "暂停" ? (
                        <p>
                            将仅暂停该通道：停止录制和重连，并保留通道、分组、算法配置和历史记录。当前片段处理完成后显示「已暂停」。暂停期间的画面不会补录，也不会影响同组其他通道。
                        </p>
                    ) : (
                        <p>
                            将仅恢复该通道：使用原通道和原分组重新拉流。暂停期间的画面不会补录。Worker
                            接受启动后，模型加载和视频流是否正常需要另行确认。
                        </p>
                    )}
                    <div className="flex justify-center gap-4 mt-2">
                        <button
                            type="button"
                            disabled={acting}
                            className="min-w-[100px] h-10 px-4 py-2 rounded border border-[#d1d5dc] bg-white text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                            onClick={() => setConfirm(null)}
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            disabled={acting}
                            className="min-w-[100px] h-10 px-4 py-2 rounded border border-transparent bg-[#00aeec] text-white hover:bg-[#00b5e5] cursor-pointer disabled:opacity-40"
                            onClick={() => {
                                void submitLifecycle();
                            }}
                        >
                            {acting ? "提交中" : `确认${confirm?.action ?? ""}`}
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

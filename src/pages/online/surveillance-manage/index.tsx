import { useEffect, useState } from "react";

import {
    strategyReverseMap,
    SurveillanceCameraInfo,
    svStrategy,
} from "../types";
import { convertCertainSvInfo2SvInfo, mapStrategyName2Id } from "../util";
import BatchManage from "./components/batchManage";
import DeleteGroup from "./components/deleteGroup";
import SvCard from "./components/svCard";

import { api } from "@/api";
import GenreTab, { TabItem } from "@/components/genre-tab";
import { PageLoading } from "@/components/page-loading";
import { Pagination } from "@/components/pagination";
import NotExist from "@/pages/video-player/assets/not-exist.svg?react";
import { Message } from "@/util/ui";

// 模拟接口：获取分组信息
const fetchGroups = async (): Promise<TabItem[]> => {
    const res = await api.online.getAllGroups();
    return res.Data.map((item) => ({
        key: item.Id.toString(),
        label: item.Name,
        count: item.Num,
        offset: 10,
    }));
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

    const [groups, setGroups] = useState<TabItem[]>([]);
    const [refreshTS, setRefreshTS] = useState(0); // 用于删除组别之后的重新刷新请求
    // 初始化：先请求 groups，再请求默认组的视频
    useEffect(() => {
        const loadGroups = async () => {
            setLoading(true);
            const groupRes = await fetchGroups();
            setGroups(groupRes);
            const defaultKey = groupRes[0]?.key || "";
            setCurKey(defaultKey);
            const totalNum =
                groupRes.find((item) => item.key === defaultKey)?.count ?? 0;
            setTotal(totalNum);
            const data = totalNum
                ? await fetchGroupData(defaultKey, 0, PERPAGE)
                : [];
            setCurSvGroup(data);
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
            setLoading(false);
        };
        loadGroupData(curKey);
        setTotal(groups.find((item) => item.key === curKey)?.count ?? 1);
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
            const rst = await api.online.delStrategies(
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

    const onUpdateStrategies = async (svId: string, sts: svStrategy[]) => {
        setCurSvGroup((prev) =>
            prev.map((item) => {
                if (item.svId !== svId) return item;
                else {
                    return {
                        ...item,
                        appliedStrategies: sts,
                    };
                }
            }),
        );
        // 还缺少了向后端发送请求
        const ids = sts.map((item) => strategyReverseMap[item]);
        await api.online.updateStrategies(svId, ids);
        Message.success("", `成功更新监控所应用算法`);
    };
    return (
        <div className="h-full w-full px-15 pt-6 flex flex-col">
            {/* 顶部分组标签 */}
            <GenreTab
                tabs={groups}
                defaultActiveKey={curKey}
                onChange={(key) => setCurKey(key)}
            />
            {/* 分割线 */}
            <div className="border-b border-solid border-gray-1 mb-5"></div>
            {/* 批量管理区 */}
            <div className="flex gap-4">
                <BatchManage
                    curSvInfos={curSvGroup}
                    batchManageAddAlg={batchManageAddAlg}
                    batchManageRemoveAlg={batchManageRemoveAlg}
                />
                <DeleteGroup
                    onFinish={async () => {
                        setRefreshTS((prev) => prev + 1);
                    }}
                    groupId={Number(curKey)}
                ></DeleteGroup>
            </div>
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
                            onUpdateStrategies={(sts: svStrategy[]) => {
                                onUpdateStrategies(item.svId, sts);
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
                        setLoading(false);
                    }}
                />
            </div>
        </div>
    );
}

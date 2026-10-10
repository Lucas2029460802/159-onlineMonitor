import { Select } from "antd";
import { useEffect, useState } from "react";
import { data } from "react-router-dom";

import { SurveillanceCameraInfo } from "../types";
import { convertCertainSvInfo2SvInfo, mapPc2Formate } from "../util";
import PcVisual from "./components/PcVisual";
import SurveillanceTree from "./components/SvTree";
import PeopleCountSummary from "./total/PeopleCountSummary";
import TotalPeopleChart from "./total/TotalPeopleChart";
import { reqeustSummaryData } from "../util/request";

import { api } from "@/api";
import { GetPeopleCountSummaryRes, GroupInfo } from "@/api/type";
import { IconWait } from "@/assets/svg";
import { PageLoading } from "@/components/page-loading";
import NotExist from "@/pages/video-player/assets/not-exist.svg?react";
import { $PC } from "@/store/peoplecount";
export default function PeopleCount() {
    const [loading, setLoading] = useState(true);
    const svInfo = $PC.use().svInfo;
    const selectedTreeIds = $PC.use().selectedTreeIds;
    const CARD_ROW = $PC.use().MAX_CARD_ROW;
    const CARD_TOTAL = 8;
    const cardSvIds = $PC.use().cardSvIds;

    const handleSelectChange = (selectedTreeIds: string[]) => {
        console.log("selectedTreeIds", selectedTreeIds);
        const selectedTrueSvIds = selectedTreeIds.map((item) =>
            item.slice(item.indexOf("%") + 1),
        );
        $PC.update("set selected", (pc) => {
            const newCardSvIds = [...pc.cardSvIds];
            // 清除被删除的监控
            for (let i = 0; i < newCardSvIds.length; i++) {
                const id = newCardSvIds[i];
                if (id && !selectedTrueSvIds.includes(id)) {
                    newCardSvIds[i] = null;
                }
            }
            // 添加新选中的监控
            selectedTrueSvIds.forEach((id) => {
                if (!newCardSvIds.includes(id)) {
                    const idx = newCardSvIds.indexOf(null);
                    if (idx !== -1) newCardSvIds[idx] = id;
                }
            });
            pc.cardSvIds = newCardSvIds;
            console.log("新的card sv ids", newCardSvIds);
        });
    };

    // 所有监控组
    const [svGroups, seSvGroups] = useState<GroupInfo[]>([]);
    useEffect(() => {
        const load = async () => {
            const res = await api.online.getAllGroups();
            seSvGroups(res.Data);
        };
        load();
    }, []);

    // 请求汇总数据
    const [summaryTimeStamp, setSummaryTimeStamp] = useState(0);
    const [choosedGroupId, setChoosedGroupId] = useState<number | null>(null);
    const [summaryData, setSummaryData] =
        useState<GetPeopleCountSummaryRes | null>(null);
    useEffect(() => {
        console.log(summaryTimeStamp);
        const load = async () => {
            if (choosedGroupId === null) {
                setSummaryData(null);
                return;
            }
            const res = await reqeustSummaryData(
                choosedGroupId,
                summaryTimeStamp,
            );
            setSummaryData(res);
        };
        load();
    }, [summaryTimeStamp, choosedGroupId]);
    useEffect(() => {
        setInterval(() => {
            setSummaryTimeStamp((prev) => prev + 1);
        }, 5000);
    }, []);

    return (
        <div className="h-full w-full flex">
            {/* ===== 左侧监控树结构 ===== */}
            <div className="w-64 bg-white shadow-md rounded-xl p-4 overflow-y-auto">
                <h3 className="pl-1 text-lg font-semibold mb-4 text-gray-700">
                    选择监控组
                </h3>
                <div className="mb-4">
                    <Select
                        className="w-full "
                        defaultValue="等待选择"
                        options={svGroups.map((g) => ({
                            label: g.Name,
                            value: g.Id,
                        }))}
                        onSelect={async (gruopId: string) => {
                            // 清理过去的数据
                            $PC.update("clear sv", (pc) => {
                                pc.svInfo = [];
                                pc.cardSvIds = Array(CARD_TOTAL).fill(null);
                                pc.selectedTreeIds = [];
                            });

                            // 更新新组的数据
                            setChoosedGroupId(Number(gruopId));
                            setLoading(true);
                            const res = await api.online.allPeopleCountSv();
                            const nowGroup = res.Data.filter(
                                (s) => s.group_id === Number(gruopId),
                            );
                            const dealt: SurveillanceCameraInfo[] =
                                nowGroup.map(convertCertainSvInfo2SvInfo);
                            $PC.update("set sv", (pc) => {
                                pc.svInfo = dealt;
                            });
                            setLoading(false);
                        }}
                    ></Select>
                </div>
                <SurveillanceTree
                    data={svInfo}
                    selectedIds={selectedTreeIds}
                    onSelect={(s) => {
                        $PC.update("set selected", (pc) => {
                            pc.selectedTreeIds = s;
                        });
                        handleSelectChange(s);
                    }}
                    maxSelect={CARD_TOTAL}
                />
            </div>

            {/* ===== 右侧主内容区 ===== */}
            <div className="flex-1 overflow-scroll flex flex-col pt-4 px-6">
                {choosedGroupId === null ? (
                    <div className="flex h-full items-center justify-center text-2xl gap-4">
                        <div className="h-8 w-8">
                            <IconWait />
                        </div>
                        <div>请在左侧选择监控组</div>
                    </div>
                ) : loading ? (
                    <PageLoading
                        title="监控加载中"
                        description="正在获取监控画面"
                    />
                ) : (
                    <>
                        <div className="relative w-full">
                            <div
                                // 条件：有 summaryData 时添加 "opacity-100 h-auto"，否则 "opacity-0 h-0"
                                className={`
                                    w-full flex gap-6 bg-[#FAFAFA] px-4 py-3 rounded-xl shadow-sm
                                    transition-all duration-300 ease-in-out  
                                    overflow-hidden  
                                    ${summaryData ? "opacity-100 h-auto" : "opacity-0 h-0 px-0"}
                                `}
                            >
                                <div className="flex-1 min-w-0">
                                    <TotalPeopleChart
                                        data={
                                            summaryData
                                                ? summaryData.Data.sample_stats.map(
                                                      (s) =>
                                                          mapPc2Formate(
                                                              s,
                                                              "hour",
                                                          ),
                                                  )
                                                : null
                                        }
                                    />
                                </div>

                                <PeopleCountSummary data={summaryData} />
                            </div>
                            <PcVisual
                                svInfo={svInfo}
                                cardSvIds={cardSvIds}
                                cardRow={CARD_ROW}
                                onSelectChange={handleSelectChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

import { Segmented } from "antd";
import { useEffect, useState } from "react";

import PcTable from "./components/PcTable";
import PcVisual from "./components/PcVisual";
import SurveillanceTree from "./components/SvTree";
import { SurveillanceCameraInfo } from "../types";
import { convertCertainSvInfo2SvInfo } from "../util";

import { api } from "@/api";
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
    const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

    // 请求数据
    useEffect(() => {
        const load = async () => {
            const res = await api.online.allPeopleCountSv();
            const dealt: SurveillanceCameraInfo[] = res.Data.map(
                convertCertainSvInfo2SvInfo,
            );
            $PC.update("set sv", (pc) => {
                pc.svInfo = dealt;
            });
            setLoading(false);
        };
        load();
    }, []);

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

    return (
        <div className="h-full w-full flex">
            {/* ===== 左侧监控树结构 ===== */}
            <div className="w-64 bg-white shadow-md rounded-xl p-4 mr-6 overflow-y-auto">
                <h3 className="pl-1 text-lg font-semibold mb-4 text-gray-700">
                    监控列表
                </h3>

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
            <div className="flex-1 overflow-scroll flex flex-col pt-4 ">
                {loading ? (
                    <PageLoading
                        title="监控加载中"
                        description="正在获取监控画面"
                    />
                ) : svInfo.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <span className="w-20 h-20">
                            <NotExist />
                        </span>
                        <span className="ml-4 text-2xl text-[#cdcdcd]">
                            暂无可用人流监控
                        </span>
                    </div>
                ) : (
                    <>
                        <Segmented
                            options={[
                                { label: "视图模式", value: "visual" },
                                { label: "表格模式", value: "table" },
                            ]}
                            value={viewMode}
                            onChange={(value) => {
                                setViewMode(value as "visual" | "table");
                                console.log(viewMode, value);
                            }}
                            size="large"
                            className="w-max my-4 mb-6 shadow-sm border border-[#e5e7eb] rounded-xl bg-white"
                        />

                        <div className="relative w-full">
                            <div
                                className={`transition-opacity duration-200 ${
                                    viewMode === "visual"
                                        ? "opacity-100 pointer-events-auto"
                                        : "opacity-0 pointer-events-none absolute inset-0"
                                }`}
                            >
                                <PcVisual
                                    svInfo={svInfo}
                                    cardSvIds={cardSvIds}
                                    cardRow={CARD_ROW}
                                    onSelectChange={handleSelectChange}
                                />
                            </div>

                            <div
                                className={`transition-opacity duration-200 ${
                                    viewMode === "table"
                                        ? "opacity-100 pointer-events-auto"
                                        : "opacity-0 pointer-events-none absolute inset-0"
                                }`}
                            >
                                <PcTable
                                    svInfo={svInfo}
                                    cardSvIds={cardSvIds}
                                    curViewMode={viewMode}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

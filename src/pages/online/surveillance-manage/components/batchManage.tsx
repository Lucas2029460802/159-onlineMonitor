import { Select, SelectProps } from "antd";
import { useRef, useState } from "react";

import {
    strategyNamesArr,
    SurveillanceCameraInfo,
    svStrategy,
} from "../../types";
import { mapStrategyName2Id } from "../../util";

import { IconAlgManage, IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
interface BatchManageProps {
    curSvInfos: SurveillanceCameraInfo[];
    batchManageAddAlg: (svIds: string[], algs: svStrategy[]) => void;
    batchManageRemoveAlg: (svIds: string[], algs: svStrategy[]) => void;
}
export default function BatchManage({
    curSvInfos,
    batchManageAddAlg,
    batchManageRemoveAlg,
}: BatchManageProps) {
    const [showPopup, setShowPopup] = useState(false);
    const algoOptions: SelectProps["options"] = strategyNamesArr.map((str) => ({
        lable: mapStrategyName2Id(str),
        value: str,
    }));
    algoOptions.pop(); // 移除未知策略

    const targetOptions: SelectProps["options"] = curSvInfos.map((item) => ({
        label: item.name,
        value: item.svId,
    }));
    const [selectedAlgos, setSelectedAlgos] = useState<svStrategy[]>([]);
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const handleAdd = () => {
        console.log("添加", selectedTargets, selectedAlgos);
        batchManageAddAlg(selectedTargets, selectedAlgos);
        handleCancel();
    };

    const handleRemove = () => {
        console.log("移除", selectedTargets, selectedAlgos);
        batchManageRemoveAlg(selectedTargets, selectedAlgos);
        handleCancel();
    };

    const handleCancel = () => {
        setSelectedAlgos([]);
        setSelectedTargets([]);
        setShowPopup(false);
    };

    const rootRef = useRef<HTMLDivElement>(null);
    return (
        <div className="flex gap-[10px] py-2.5  text-sm ">
            <div
                onClick={() => {
                    setShowPopup(true);
                }}
                className={`hover:opacity-90 w-35 px-[1px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center text-[white] bg-[#fb7299] `}
            >
                <IconAlgManage className="h-3/5 mr-2"></IconAlgManage>
                <span>算法批量布控</span>
            </div>
            <Popup
                show={showPopup}
                className="w-[700px] bg-white border-0 rounded-lg"
                ref={rootRef}
            >
                <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between">
                    <div className="text-blue-2 ">算法批量布控</div>
                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer"
                        onClick={() => {
                            setShowPopup(false);
                        }}
                    />
                </div>
                <div className="p-12 flex flex-col gap-6">
                    <div>
                        <div className="mb-2 text-gray-700 text-base font-medium">
                            选择目标对象
                        </div>

                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="请选择目标对象"
                            options={targetOptions}
                            value={selectedTargets}
                            onChange={setSelectedTargets}
                            className="w-full"
                            showSearch
                            getPopupContainer={() => rootRef.current!}
                        />
                    </div>
                    <div>
                        <div className="mb-2 text-gray-700 text-base font-medium">
                            选择算法
                        </div>
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="请选择算法"
                            showSearch
                            options={algoOptions}
                            value={selectedAlgos}
                            onChange={setSelectedAlgos}
                            getPopupContainer={() => rootRef.current!}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-blue-1 bg-blue-1 text-white rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#00b5e5] hover:border-[#00b5e5]"
                            onClick={handleAdd}
                        >
                            添加
                        </button>

                        <button
                            className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-[#fb2c36] bg-[#fb2c36] text-white rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#e7000b] hover:border-[#e7000b]"
                            onClick={handleRemove}
                        >
                            移除
                        </button>

                        <button
                            className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-gray-1 bg-white text-text-5 rounded-sm flex items-center justify-center cursor-pointer hover:bg-border-2"
                            onClick={handleCancel}
                        >
                            取消
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

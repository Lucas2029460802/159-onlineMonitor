import { Dispatch, FC, useState } from "react";

import { api } from "@/api";
import { Video } from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { CheckBox } from "@/components/checkbox";
import { Popup } from "@/components/popup";
import { Table } from "@/components/table";
import { $UI } from "@/store/ui";

interface CheckBoxesProps {
    setShow: Dispatch<React.SetStateAction<boolean>>;
    videos: Video[];
    onRefresh?: () => void;
    pause?: boolean;
}

export const CheckBoxes: FC<CheckBoxesProps> = (props) => {
    const { videos, setShow, onRefresh, pause = false } = props;
    const [ids, setIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    return (
        <Popup show className="border-0">
            <div className="py-6 px-[38px] bg-white rounded-lg w-[754px]">
                <div className="pb-[18px] flex items-center justify-between">
                    <div className="text-base text-text-5">
                        {!pause ? "批量分析" : "批量暂停"}
                    </div>
                    <button
                        className="px-3 w-20 h-8 rounded-md text-sm bg-blue-1 flex items-center justify-center text-white gap-2 hover:opacity-90 cursor-pointer"
                        onClick={() => {
                            if (ids.length !== videos.length)
                                setIds(videos.map((item) => item.Id));
                            else setIds([]);
                        }}
                    >
                        <div>全选</div>
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-scroll">
                    <Table
                        titles={["选择", "名字"]}
                        flexes={[1, 8]}
                        rows={videos.map((item) => [
                            <div
                                key={`checkbox-${item.Id}`}
                                className="w-[18px]"
                            >
                                <CheckBox
                                    checked={ids.includes(item.Id)}
                                    type="multi"
                                    onClick={() => {
                                        if (ids.includes(item.Id)) {
                                            setIds((prev) =>
                                                prev.filter(
                                                    (i) => i !== item.Id,
                                                ),
                                            );
                                        } else {
                                            setIds((prev) => [
                                                ...prev,
                                                item.Id,
                                            ]);
                                        }
                                    }}
                                />
                            </div>,
                            item.Name,
                        ])}
                    />
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-[10px]">
                    <button
                        className="rounded-sm bg-blue-1 w-[90px] h-7 text-xs text-white border border-solid border-blue-1 hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                        onClick={async () => {
                            if (loading) return;
                            setLoading(true);
                            if (ids.length > 0) {
                                if (pause) await api.video.stopWaitingList(ids);
                                else await api.process.list(ids);
                                if (onRefresh) onRefresh();
                                setShow(false);
                            } else {
                                $UI.update("choose at least one", (draft) => {
                                    draft.messageDisplay = true;
                                    draft.messageType = "warning";
                                    draft.messageContent = pause
                                        ? "请至少选择一个视频暂停"
                                        : "请至少选择一个视频进行分析";
                                });
                            }
                            setLoading(false);
                        }}
                    >
                        {loading && <IconLoading className="text-xs" />}
                        确定
                    </button>
                    <button
                        className="rounded-sm bg-white w-[90px] h-7 text-xs text-[#222] border border-solid border-gray-1 cursor-pointer"
                        onClick={() => setShow(false)}
                    >
                        取消
                    </button>
                </div>
            </div>
        </Popup>
    );
};

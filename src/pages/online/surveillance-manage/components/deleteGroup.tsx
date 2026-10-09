import { useRef, useState } from "react";

import { api } from "@/api";
import { IconClose, IconDelete } from "@/assets/svg";
import { Popup } from "@/components/popup";
interface BatchManageProps {
    onFinish: () => void;
    groupId: number;
}
export default function DeleteGroup({ onFinish, groupId }: BatchManageProps) {
    const [showPopup, setShowPopup] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    return (
        <div className="flex gap-[10px] py-2.5  text-sm  ">
            <div
                onClick={() => {
                    setShowPopup(true);
                }}
                className={`hover:opacity-90 w-35 px-[1px] h-8  rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center text-[white] bg-[#fb1a1a] `}
            >
                <IconDelete className="h-3/5 mr-2"></IconDelete>
                <span>删除本组</span>
            </div>
            <Popup
                show={showPopup}
                className="w-[700px] bg-white border-0 rounded-lg"
                ref={rootRef}
            >
                <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between">
                    <div className="text-blue-2 ">删除本组</div>
                    <IconClose
                        className="text-lg text-gray-2 cursor-pointer"
                        onClick={() => {
                            setShowPopup(false);
                        }}
                    />
                </div>
                <div className="flex flex-col items-center p-8 gap-6 bg-white rounded-lg shadow-sm">
                    {/* 标题部分：增加字体粗细，突出警示感 */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            确认删除该组？
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            此操作无法撤销，请谨慎操作。
                        </p>
                    </div>

                    {/* 按钮组：使用 flex 和 gap 控制间距 */}
                    <div className="flex gap-4 w-full justify-center">
                        {/* 取消按钮：弱化视觉，使用边框样式 */}
                        <button
                            className="min-w-[100px] h-10 px-4 py-2 rounded border border-[#d1d5dc] bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                            onClick={() => setShowPopup(false)}
                        >
                            取消
                        </button>

                        {/* 确认按钮：红色，代表破坏性操作 */}
                        <button
                            className="min-w-[100px] h-10 px-4 py-2 rounded border border-transparent bg-[#e7000b] text-white hover:bg-[#c10007] transition-colors cursor-pointer shadow-sm"
                            onClick={async () => {
                                // 建议：先显示 loading 再关闭弹窗（见版本2），这里保持你原有逻辑
                                setShowPopup(false);
                                try {
                                    await api.online.deleteGroup(groupId);
                                    onFinish();
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                        >
                            确认删除
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ChatHistory from "./charHistory";
import FoldButton from "./fold_button";
import UnfoldButton from "./unfold_button";

import { api } from "@/api";
import { IconNewChat, IconAgent } from "@/assets/svg";
import { $Rag } from "@/store/rag";

export default function ChatSideBar() {
    const [isFolded, setIsFolded] = useState(false);
    const { taskId } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            const list = await api.chat.allChatHistory(taskId);
            $Rag.update("update history list", (r) => {
                r.history_list = list.sort((a, b) => b.id - a.id);
            });
        };
        fetchData();
    }, []);

    return (
        <div
            id="sidebar-outlet"
            className={`transition-[width] duration-300 bg-white border-r border-[#e5e7eb] ${
                isFolded ? "w-13 min-w-13" : "w-64 min-w-64"
            }`}
        >
            <div id="two-sidebar-container" className="relative w-full h-full">
                <div
                    id="sidebar-slim"
                    className={`absolute top-0 left-0 h-[calc(100%-16px)] w-13 transition-opacity duration-300 ${
                        isFolded
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    } flex flex-col items-center mt-4`}
                >
                    {/*相当于px-[14px] px-3.5*/}
                    <div className="w-13 h-13  flex items-center justify-center">
                        <UnfoldButton
                            handleUnfold={() => {
                                setIsFolded(false);
                            }}
                        ></UnfoldButton>
                    </div>

                    <a
                        className="w-full h-9 flex justify-center items-center cursor-pointer"
                        title="新聊天"
                    >
                        <IconNewChat />
                    </a>
                </div>

                <div
                    id="sidebar-wide"
                    className={`px-1 absolute top-0 left-0 h-[calc(100%-16px)] w-64 min-w-64 flex flex-col transition-opacity duration-300 mt-4 overflow-y-scroll ${
                        isFolded
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100 pointer-events-auto"
                    }`}
                >
                    <div
                        id="sidebar-wide-header"
                        className="sticky top-0 bg-white z-10 "
                    >
                        <div className="h-13 px-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                                <IconAgent />
                            </div>
                            <FoldButton
                                onFold={() => {
                                    setIsFolded(true);
                                }}
                            ></FoldButton>
                        </div>

                        <div className="h-9 px-0.5 ">
                            <div
                                className="w-full h-full px-2 flex items-center gap-1.5 rounded-xl hover:bg-[#f3f4f6] cursor-pointer"
                                onClick={() => {
                                    $Rag.update("select chat", (r) => {
                                        r.curChatId = undefined; // 重置为新对话
                                        r.messages = []; // 清空消息
                                        r.started = false; // 设置为未开始状态
                                    });
                                }}
                            >
                                <a className="h-full w-6 flex items-center justify-center text-[#1e2939]">
                                    <IconNewChat />
                                </a>
                                <a>
                                    <span className="text-sm">新对话</span>
                                </a>
                            </div>
                        </div>
                        <div className="h-2 border-b border-[#f3f4f6]"></div>
                    </div>

                    <ChatHistory></ChatHistory>
                </div>
            </div>
        </div>
    );
}

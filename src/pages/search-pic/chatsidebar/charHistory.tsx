import { useRef } from "react";

import { api } from "@/api";
import { IconDelete } from "@/assets/svg";
import { $Rag } from "@/store/rag";

export default function ChatHistory() {
    const chatList = $Rag.use((r) => r.history_list);
    console.log(chatList);

    const deleteLock = useRef<null | number>(null);
    return (
        <div className="pt-4 flex-1">
            <div className="text-sm px-2 py-2 text-gray-500 h-9">
                <h2>历史对话列表</h2>
            </div>
            <ul className="">
                {chatList.map((c) => (
                    <li
                        key={c.id}
                        className="h-9 px-2.5 py-2 text-sm text-gray-800 hover:bg-[#f3f4f6] rounded-xl cursor-pointer truncate group"
                        title={c.title}
                        onClick={async () => {
                            const chatHistory = await api.chat.oneChatHistory(
                                c.id,
                            );
                            $Rag.update("select chat", (r) => {
                                r.curChatId = c.id;
                                r.messages = chatHistory.messages.map(
                                    (item) => {
                                        const files: string[] = [];
                                        let content = "";
                                        item.content.forEach((contentItem) => {
                                            if (contentItem.type === "text") {
                                                content = contentItem.text;
                                            } else {
                                                files.push(contentItem.image);
                                            }
                                        });
                                        return {
                                            role:
                                                item.role === "user"
                                                    ? "user"
                                                    : "bot",
                                            content: content,
                                            files: files,
                                        };
                                    },
                                );
                                r.started = true; // 设置为已开始状态
                            });
                        }}
                    >
                        <div className="px-1 flex justify-between">
                            <span>
                                {c.title.length > 16
                                    ? c.title.slice(0, 16) + "..."
                                    : c.title}
                            </span>
                            <span
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    // 防止短时间内多次点击
                                    if (deleteLock.current !== null) return;
                                    deleteLock.current = setTimeout(() => {
                                        deleteLock.current = null;
                                    }, 1000);
                                    const res =
                                        await api.chat.deleteChatHistory(c.id);
                                    if (res.status === 200) {
                                        $Rag.update("delete chat", (r) => {
                                            r.history_list =
                                                r.history_list.filter(
                                                    (item) => item.id !== c.id,
                                                );
                                            if (r.curChatId === c.id) {
                                                r.curChatId = undefined; // 清除当前聊天ID
                                                r.messages = []; // 清空消息
                                                r.started = false; // 设置为未开始状态
                                            }
                                        });
                                    }
                                }}
                                className="opacity-0 group-hover:opacity-100 flex justify-center items-center hover:text-[#fb2c36]"
                                title="删除对话"
                            >
                                <IconDelete />
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

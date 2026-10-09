// ChatLayout.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import ChatInput from "./chatInput";
import NowChatHistory from "./nowChatHistory";
import { sayHello } from "./util";
import { parseSSEStream } from "./util/parseSSE";

import { api } from "@/api";
import { $Rag, Message, ResStatus } from "@/store/rag";

export default function ChatLayout() {
    const messages = $Rag.use((r) => r.messages);
    const text = $Rag.use((r) => r.searchText);
    const previewFiles = $Rag.use((r) => r.previewFiles);
    const started = $Rag.use((r) => r.started);
    const status = $Rag.use((r) => r.resStatus);
    const taskId = useParams().taskId;

    const simulateBotResponse = async (
        prompt: string,
        chatId: number | undefined,
    ) => {
        const response = await api.chat.chat(prompt, taskId, chatId);
        let botMessage = "";
        let botMsgInserted = false;

        $Rag.update("start bot response", (r) => {
            r.resStatus = ResStatus.AwaitFirstToken;
        });

        await parseSSEStream(
            response,
            (data) => {
                if (data.trim() === "__start__") return;

                botMessage += data; // 去掉第一个空格
                // console.log("Bot message so far:", botMessage);
                // console.log($Rag.get().messages);
                $Rag.update("receive bot token", (r) => {
                    const updated = [...r.messages];
                    if (!botMsgInserted) {
                        updated.push({
                            role: "bot",
                            content: data,
                            files: [],
                        });
                        botMsgInserted = true;
                    } else {
                        const last = updated[updated.length - 1];
                        if (last?.role === "bot") {
                            updated[updated.length - 1] = {
                                ...last,
                                content: botMessage,
                            };
                        }
                    }
                    r.messages = updated;
                    r.resStatus = ResStatus.Streaming;
                });
            },
            () => {
                $Rag.update("bot message complete", (r) => {
                    r.resStatus = ResStatus.Idle;
                });
            },
            async (chatMeta) => {
                const list = await api.chat.allChatHistory(taskId);
                $Rag.update("update history list", (r) => {
                    r.history_list = list.sort((a, b) => b.id - a.id);
                    r.curChatId = chatMeta.id; // 更新当前聊天ID
                });
            },
            (err) => {
                console.error("❌ SSE 解析失败", err);
                $Rag.update("bot message error", (r) => {
                    r.resStatus = ResStatus.Idle;
                });
            },
        );
    };
    const handleSend = () => {
        if (!text.trim() && previewFiles.length === 0) return;
        const newMsg: Message = {
            role: "user",
            content: text,
            // files: previewFiles, 暂且先不处理文件
            files: [],
        };
        $Rag.update("new user message", (r) => {
            // 新用户信息
            r.messages = [...r.messages, newMsg];

            // 清空输入
            r.searchText = "";
            r.previewFiles = [];
            r.started = true;
        });
        simulateBotResponse(text, $Rag.get().curChatId);
    };
    console.log("task id is ", taskId);

    return (
        <div className="w-full max-w-[960px] h-full flex flex-col items-center bg-white px-4 relative">
            <div className="w-full max-h-[calc(100%-142px)] px-4 grow-1 relative transition-[flex-grow] duration-300">
                {!started ? (
                    <div className="text-center my-8 absolute bottom-0 left-1/2 -translate-x-1/2">
                        <h1 className="text-4xl font-bold text-black mb-4">
                            {sayHello()}
                            {", 警官"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {/* 用自然语言搜索语义最相关图片，让大模型检索回答 */}
                            上传文档或图片，让小浦理解回答
                        </p>
                    </div>
                ) : (
                    <NowChatHistory messages={messages} status={status} />
                )}
            </div>

            <div
                className={twMerge(
                    `w-full bg-white transition-[flex-grow] duration-1000`,
                    started ? "grow-0" : "grow-1",
                )}
            >
                <ChatInput onSend={handleSend} />
                <div className="h-4"></div>
            </div>
        </div>
    );
}

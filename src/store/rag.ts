import { model } from "@/packages/model";
import { Message } from "@/util/ui";
export interface Message {
    role: "user" | "bot";
    content: string;
    files: string[]; //urls of files
}
export enum ResStatus {
    Idle = "Idle", // 无用户输入（回答结束）
    AwaitFirstToken = "AwaitFirstToken", // 有用户输入，但是在等待首个token
    Streaming = "Streaming", // 正在回答
}
export interface HistoryItem {
    id: number;
    title: string;
}

export interface RagModel {
    messages: Message[];
    history_list: HistoryItem[]; // 历史聊天记录
    searchText: string;
    previewFiles: File[]; // 当前输入框里的文件最好
    started: boolean;
    resStatus: ResStatus; // 服务端处理状态
    curChatId: number | undefined; // 当前聊天ID
}

export const $Rag = model<RagModel>("RAG", {
    messages: [],
    history_list: [],
    searchText: "",
    previewFiles: [],
    started: false,
    resStatus: ResStatus.Idle,
    curChatId: undefined, // 融入聊天id
});

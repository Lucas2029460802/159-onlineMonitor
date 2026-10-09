import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import LoadingBall from "./loading-ball/loading-ball";
import { mockMessages } from "./util/mockMessages";

import { $Rag, ResStatus } from "@/store/rag";
export interface Message {
    role: "user" | "bot";
    content: string;
    image?: string;
}

function renderUser(msg: Message, key?: string) {
    return (
        <div key={key} className="flex justify-end">
            <div className="rounded-lg px-4 py-2 max-w-[80%] break-words whitespace-pre-wrap bg-[#dbeafe] text-left">
                {msg.image && (
                    <img
                        src={msg.image}
                        alt="uploaded"
                        className="w-32 h-auto mb-1 rounded"
                    />
                )}
                <div>{msg.content}</div>
            </div>
        </div>
    );
}

function renderBot(msg: Message, key?: string) {
    console.log("bot msg", msg.content);
    return (
        <div key={key} className="flex justify-start">
            <div className="w-9 h-9 rounded-[18px]">
                <img src="/xiaopu.png" alt="小浦头像" />
            </div>
            <div className="rounded-lg px-4 py-2 w-[90%] break-words  bg-[#f3f4f6] text-left">
                {msg.image && (
                    <img
                        src={msg.image}
                        alt="uploaded"
                        className="w-32 h-auto mb-1 rounded"
                    />
                )}
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: (props) => (
                            <>
                                <h1
                                    className="text-4xl font-bold mb-2 py-1 border-b-1  border-[#e5e7eb]"
                                    {...props}
                                />
                            </>
                        ),
                        h2: (props) => (
                            <h2
                                className="text-3xl font-bold mb-2 py-1 border-b-1  border-[#e5e7eb]"
                                {...props}
                            />
                        ),
                        h3: (props) => (
                            <h3
                                className="text-2xl font-bold mb-2 py-1 "
                                {...props}
                            />
                        ),
                        h4: (props) => (
                            <h4
                                className="text-1xl font-bold mb-2 py-1 "
                                {...props}
                            />
                        ),
                        p: (props) => (
                            <p className="text-gray-800" {...props} />
                        ),
                        ol: (props) => (
                            <ol
                                className="list-decimal pl-8 space-y-2 my-4"
                                {...props}
                            />
                        ),
                        ul: (props) => (
                            <ul
                                className="list-disc pl-8 space-y-2 my-4"
                                {...props}
                            />
                        ),
                        li: (props) => (
                            <li
                                className="marker:text-gray-700 font-medium"
                                {...props}
                            />
                        ),
                        a: (props) => (
                            <a
                                className="text-[#2964aa] hover:text-[#749ac8]"
                                {...props}
                            ></a>
                        ),
                        img: ({ ...props }) => (
                            <img
                                {...props}
                                className="inline-block  max-w-[19%] space-x-2 my-1 object-contain rounded-lg"
                                style={{ verticalAlign: "middle" }}
                                alt={props.alt || ""}
                            />
                        ),
                    }}
                >
                    {msg.content}
                </ReactMarkdown>
            </div>
        </div>
    );
}

function renderMsg(msg: Message, key?: string) {
    return msg.role === "user" ? renderUser(msg, key) : renderBot(msg, key);
}

export default function NowChatHistory({
    messages,
    status,
}: {
    messages: Message[];
    status: ResStatus;
}) {
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
            console.log("滚动到底部");
        }
    }, [messages]);
    const resStatus = $Rag.use((r) => r.resStatus);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    return (
        <div
            className="h-full space-y-4 pt-4 pb-25 overflow-y-scroll"
            ref={chatContainerRef}
        >
            {messages.map((msg, idx) => renderMsg(msg, idx.toString()))}
            {/* {mockMessages.map((msg, idx) => renderMsg(msg, idx.toString()))} */}
            {resStatus === ResStatus.AwaitFirstToken ? <LoadingBall /> : <></>}
        </div>
    );
}

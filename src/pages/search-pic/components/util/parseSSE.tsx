export async function parseSSEStream(
    response: Response,
    onMessage: (data: string) => void,
    onDone?: () => void,
    onMeta?: (meta: { id: number; title: string }) => void,
    onError?: (err: any) => void,
) {
    if (!response.ok || !response.body) {
        onError?.(new Error("响应无效或无内容"));
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let seenDone = false;

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const newReceived = decoder.decode(value, { stream: true });
            const byDataSplitLines = newReceived
                .split("data: ")
                .map((x) => x.replace("\n\n", "\n"))
                .map((x) => x.slice(0, x.length - 1)); // SSE默认结尾是\n\n，此时被替换成\n，并在这里被删去,而原本的\n一定是在内部，因此不会被删去
            for (const line of byDataSplitLines) {
                if (line === "") continue;
                if (!seenDone) {
                    if (line === "[DONE]") {
                        seenDone = true;
                        onDone?.();
                    } else {
                        onMessage(line);
                    }
                } else {
                    // 收到 DONE 后的内容(也就是对话的Meta信息)
                    try {
                        const json: { id: number; title: string } =
                            JSON.parse(line);
                        onMeta?.(json);
                    } catch {
                        onError?.(new Error("无法解析元信息: " + line));
                    }
                }
            }
        }
    } catch (err) {
        onError?.(err);
    }
}

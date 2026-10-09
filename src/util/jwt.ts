// 浏览器原生 JWT 解析工具
export function decodeJwtPayload<T = unknown>(token: string): T {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [header, payload, signature] = token.split(".");
        if (!payload) throw new Error("Invalid JWT format");

        const decoded = atob(
            payload
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "="),
        );

        return JSON.parse(decoded);
    } catch (error) {
        throw new Error(`JWT decode failed: ${(error as Error).message}`);
    }
}

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { Message } from "@/util/ui";

declare module "axios" {
    export interface AxiosRequestConfig {
        /** 为 true 时不弹出全局错误提示，供状态轮询使用 */
        skipErrorMessage?: boolean;
    }
}

function isOnlineLifecycleRequest(url?: string) {
    if (!url) return false;
    return (
        url.includes("video/online/channel/pause") ||
        url.includes("video/online/channel/resume") ||
        url.includes("video/online/channel/state") ||
        url.includes("video/online/task/pause") ||
        url.includes("video/online/task/resume")
    );
}

function createAxiosInstance(baseURL: string, timeout: number): AxiosInstance {
    const instance = axios.create({
        baseURL,
        timeout,
    });

    instance.defaults.headers.get["Content-Type"] = "application/json";
    instance.defaults.headers.get.Accept = "*/*";
    instance.defaults.headers["token"] = localStorage.getItem("token");

    // 请求拦截器
    instance.interceptors.request.use(
        (config) => config,
        async (err) => Promise.reject(err),
    );

    // 日期转换函数
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function convertDates(obj: any) {
        const isoDateRegex =
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|([+-]\d{2}:\d{2}))?)?$/;
        if (obj && typeof obj === "object") {
            Object.keys(obj).forEach((key) => {
                const value = obj[key];
                if (typeof value === "string" && isoDateRegex.test(value)) {
                    obj[key] = new Date(value);
                } else if (typeof value === "object") {
                    convertDates(value);
                }
            });
        }
        return obj;
    }

    // 响应拦截器
    instance.interceptors.response.use(
        (res) => {
            if (res.headers.token) {
                instance.defaults.headers["token"] = res.headers.token;
                localStorage.setItem("token", res.headers.token);
            }
            if (res.config.responseType === "blob") {
                return res;
            }
            const data = res.data;
            convertDates(data);
            return data;
        },
        (err) => {
            console.log(err);
            const config = err.config as AxiosRequestConfig | undefined;
            const status = err.response?.status as number | undefined;
            // 通道暂停/恢复用 422 表示策略不兼容，不能按登录失效处理
            if (
                status === 401 ||
                (status === 422 && !isOnlineLifecycleRequest(config?.url))
            ) {
                localStorage.setItem("token", "");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(err);
            }
            if (!config?.skipErrorMessage) {
                const message =
                    err.response?.data?.Message ?? err.response?.data?.message;
                Message.danger(
                    "error info",
                    message !== undefined
                        ? message
                        : err.response
                          ? "未知错误: " + err.response.data
                          : "网络错误",
                );
            }
            return Promise.reject(err);
        },
    );

    return instance;
}

const instance = createAxiosInstance("/api/", 3600 * 1000);
const captionInstance = createAxiosInstance("/caption-api/", 3600 * 1000);
const instance_qwen = createAxiosInstance("/qwen/", 3600 * 10);

export { instance, captionInstance, instance_qwen };

// 模仿axios创建的fetch的错误处理逻辑
export async function handleFetchError(response: Response): Promise<never> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorData: any = null;

    try {
        errorData = await response.json(); // 解析 JSON 错误信息
    } catch {
        // fallback: 非 JSON 响应
        errorData = { message: await response.text() };
    }

    if (response.status === 401 || response.status === 422) {
        localStorage.setItem("token", "");
    }

    const message = errorData?.Message ?? errorData?.message;

    Message.danger(
        "error info",
        message !== undefined
            ? message
            : "未知错误: " + JSON.stringify(errorData),
    );

    throw new Error(message || "请求失败");
}

import { type AxiosProgressEvent } from "axios";
import dayjs, { Dayjs } from "dayjs";

import { handleFetchError, instance } from "./axios";
import { caption } from "./caption";
import {
    LoginResponse,
    GetAllUserResponse,
    UserRole,
    GetAllVideosResponse,
    ShareResponse,
    VideoInfo,
    AllEventsInfo,
    EventStatistics,
    VideoExistResponse,
    LogResponse,
    StorageResponse,
    SizeResponse,
    TaskStatus,
    TasksResponse,
    TaskEventsResponse,
    BigPicPageRes,
    ChatHistory,
    TaskResponse,
    TimeObj,
    UpdateTimeResponse,
    AllSvInfo,
    GetWebrtcSrcRes,
    GetPeopleCountRes,
    GetAllGroupsRes,
    TableDataRes,
    AlertDataRes,
    GetPeopleCountSummaryRes,
    AllSvRes,
    SearchDataRes,
    AdditionImgRes,
    SizeAggregateResponse,
    ROI,
    RpcConfigResponse,
    ServerStatusStatisticsResponse,
} from "./type";

import {
    CHUNKSIZE,
    HomePaginationSize,
    ParallelChunksSize,
    SortField,
    SortOrder,
    VideoPaginationSize,
} from "@/config";
import { urlPicGenre } from "@/pages/bigpic";
import { DeploymentData } from "@/pages/online/alg-set";
import { FlowLine } from "@/pages/online/people-count/components/DrawPopup";
import { EventType } from "@/pages/online/search";
import { svStrategyId } from "@/pages/online/types";
import { convertFlowlineToNumberArr } from "@/pages/online/util";
import { UploadFileTag } from "@/pages/upload";
import { HistoryItem } from "@/store/rag";

const user = {
    login: (name: string, password: string): Promise<LoginResponse> => {
        return instance.post("/user/login", {
            name,
            password,
        });
    },
    list: (): Promise<GetAllUserResponse> => {
        return instance.get("/user/get");
    },
    // 获取同分局下的用户列表（分局返回全部，派出所只返回自己）
    stationUsers: (): Promise<GetAllUserResponse> => {
        return instance.get("/user/station_users");
    },
    add: (name: string, password: string, station: string, role: UserRole) =>
        instance.post("/user/add", {
            name,
            password,
            role,
            station,
        }),
    // 更新用户信息（密码可选，为空则不修改）
    update: (
        id: number,
        name: string,
        password: string,
        station: string,
        role: UserRole,
    ) =>
        instance.put("/user/update", {
            Id: id,
            Name: name,
            Password: password,
            Role: role,
            Station: station,
        }),
    remove: (id: number) =>
        instance.delete(`/user/delete?user_id=${id.toString()}`),
    current: () => instance.get("/user/current_user"),
};

const video = {
    updateTime: (
        videoId: number,
        newTime: TimeObj,
    ): Promise<UpdateTimeResponse> => {
        const month = newTime.month.toString().padStart(2, "0");
        const day = newTime.day.toString().padStart(2, "0");
        const hour = newTime.hour.toString().padStart(2, "0");
        const minute = newTime.minute.toString().padStart(2, "0");
        const second = newTime.second.toString().padStart(2, "0");
        return instance.post(
            `video/update_time?video_id=${videoId}&start_time=${newTime.year}-${month}-${day} ${hour}:${minute}:${second}`,
        );
    },
    existCheck: (
        fileName: string,
        taskId: number,
    ): Promise<VideoExistResponse> => {
        return instance.get("video/exist", {
            params: {
                video_name: fileName,
                task_id: taskId,
            },
        });
    },
    list: (
        index: number,
        taskId: number,
        sortField: SortField = SortField.Filename,
        sortOrder: SortOrder = SortOrder.Desc,
        size: number = HomePaginationSize,
    ): Promise<GetAllVideosResponse> => {
        return instance.get("video/get", {
            params: {
                index,
                size,
                task_id: taskId,
                sort_field_id: sortField,
                sort_order_id: sortOrder,
            },
        });
    },
    listNum: (taskId: number): Promise<SizeResponse> =>
        instance.get("video/get_num", {
            params: { task_id: taskId },
        }),
    own: (
        index: number,
        taskId: number,
        size: number = VideoPaginationSize,
    ): Promise<GetAllVideosResponse> => {
        return instance.get("video/own", {
            params: { index, size, task_id: taskId },
        });
    },
    ownSize: (taskId: number): Promise<SizeResponse> =>
        instance.get("video/own_num", { params: { task_id: taskId } }),
    ownByStatus: (
        status: TaskStatus,
        index: number,
        taskId: number,
        size: number = VideoPaginationSize,
    ): Promise<GetAllVideosResponse> => {
        return instance.get("video/own_status", {
            params: { status, index, size, task_id: taskId },
        });
    },
    ownByStatusSize_Aggregate: (
        taskId: number,
    ): Promise<SizeAggregateResponse> =>
        instance.get("video/own_status_num_list", {
            params: { task_id: taskId },
        }),
    ownByStatusSize: (
        status: TaskStatus,
        taskId: number,
    ): Promise<SizeResponse> =>
        instance.get("video/own_status_num", {
            params: { status, task_id: taskId },
        }),
    listUnhandled: (taskId: number): Promise<GetAllVideosResponse> =>
        instance.get("video/own_status", {
            params: {
                status: TaskStatus.UNPROCESSED,
                index: 0,
                size: -1,
                task_id: taskId,
            },
        }),
    listQueuing: (taskId: number): Promise<GetAllVideosResponse> =>
        instance.get("video/own_status", {
            params: {
                status: TaskStatus.WAITING,
                index: 0,
                size: -1,
                task_id: taskId,
            },
        }),
    listError: (taskId: number): Promise<GetAllVideosResponse> =>
        instance.get("video/own_status", {
            params: {
                status: TaskStatus.ERROR,
                index: 0,
                size: -1,
                task_id: taskId,
            },
        }),
    delete: (videoId: number) =>
        instance.delete("video/delete", {
            params: {
                video_id: videoId,
            },
        }),
    createChunk: (file: File): Blob[] => {
        const totalChunks = Math.ceil(file.size / CHUNKSIZE);
        const chunkArr = [];
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNKSIZE;
            const end = Math.min(start + CHUNKSIZE, file.size);
            const chunk = file.slice(start, end);
            chunkArr.push(chunk);
        }
        return chunkArr;
    },
    createUploadContext: (
        file: File,
        taskId: number,
        tag: UploadFileTag,
        immediately: boolean,
        roi: ROI | undefined,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
        parallelChunks: number = ParallelChunksSize, // 默认并行上传块数量
    ) => {
        const chunkArr = video.createChunk(file);
        let currentIndex = 0;
        let paused = false;
        let reset = false;
        const totalSize = file.size;

        // 初始化每个块的进度数组，初始值为 0
        const chunkProgresses = new Array(chunkArr.length).fill(0);

        const updateProgress = () => {
            const totalUploaded = chunkProgresses.reduce(
                (acc, cur) => acc + cur,
                0,
            );
            const progress = totalUploaded / totalSize;

            onUploadProgress({
                loaded: totalUploaded,
                total: totalSize,
                bytes: 0,
                lengthComputable: false,
                progress,
            });
        };

        const uploadChunk = async (chunkIndex: number) => {
            if (paused || reset) return;

            const chunk = chunkArr[chunkIndex];
            const totalChunks = chunkArr.length;
            const iProgress = (axiosProgress: AxiosProgressEvent) => {
                chunkProgresses[chunkIndex] = axiosProgress.loaded;
                updateProgress();
            };

            try {
                if (!reset) {
                    currentIndex = chunkIndex + 1;
                    return await video.uploadSingleChunk(
                        file.name,
                        totalChunks,
                        chunkIndex,
                        chunk,
                        iProgress,
                        taskId,
                        tag,
                        immediately,
                        roi,
                    );
                }
            } catch (err) {
                console.error(`Error uploading chunk ${chunkIndex}:`, err);
            }
        };

        const uploadTotal = async () => {
            const promises = [];
            for (let i = currentIndex; i < chunkArr.length; ) {
                if (paused) break;
                promises.push(uploadChunk(i));

                if (promises.length >= parallelChunks) {
                    const results = await Promise.all(promises);
                    for (const result of results) {
                        if (
                            result !== undefined &&
                            result.next !== undefined &&
                            result.next !== 0 &&
                            result.status === "uploaded"
                        ) {
                            if (i < result.next) {
                                for (let j = 0; j < result.next; j++) {
                                    chunkProgresses[j] = CHUNKSIZE;
                                }
                                i = result.next - 1;
                            }
                        }
                    }
                    promises.length = 0;
                }
                i += 1;
            }
            if (promises.length > 0) {
                await Promise.all(promises);
            }
        };

        const pauseUpload = () => {
            paused = true;
        };

        const resumeUpload = () => {
            paused = false;
            reset = false;
            uploadTotal();
        };

        const resetUpload = () => {
            currentIndex = 0;
            paused = true;
            reset = true;
        };

        const cancelUpload = async () => {
            try {
                await instance.delete(
                    `/video/cancel_upload?file_name=${encodeURIComponent(file.name)}&task_id=${taskId}`,
                );
            } catch (e) {
                console.error("cancelUpload failed", e);
            }
        };

        const isUploading = () => {
            return !paused;
        };

        return {
            uploadTotal,
            pauseUpload,
            resumeUpload,
            resetUpload,
            cancelUpload,
            isUploading,
        };
    },

    uploadSingleChunk: (
        fileName: string,
        totalNum: number,
        chunkIndex: number,
        chunk: Blob,
        onUploadProgress: (axiosProgress: AxiosProgressEvent) => void,
        taskId: number,
        tag: UploadFileTag,
        immediately: boolean,
        roi: ROI | undefined,
    ): Promise<{
        index: number;
        status: "success" | "uploaded";
        next?: number;
    }> => {
        const formData = new FormData();
        formData.append("file", chunk, `${fileName}.part${chunkIndex}`);
        formData.append("name", fileName);
        formData.append("total_chunks", totalNum.toString());
        formData.append("chunk_index", chunkIndex.toString());
        formData.append("task_id", taskId.toString());
        formData.append("tag", tag);
        formData.append("auto_process", immediately.toString());
        if (roi) {
            formData.append("roi", JSON.stringify(roi));
        }
        console.log("上传的", formData);
        return instance.post("/video/upload_chunk", formData, {
            onUploadProgress,
        });
    },

    stopWaitingList: (ids: number[]) =>
        instance.post("/video/stopwaitinglist", { ids }),
    getFirstFrame: (formData: FormData) =>
        instance.post("/video/first_frame", formData),
};

const player = {
    videoInfo(id: number): Promise<VideoInfo> {
        return instance.get("/video/video_info", {
            params: {
                video_id: id,
            },
        });
    },
    allEvents(id: number): Promise<AllEventsInfo> {
        return instance.get("/video/events", {
            params: {
                video_id: id,
            },
        });
    },
    eventsLineCharts(id: number, segments: number): Promise<EventStatistics> {
        return instance.get("/video/events_info", {
            params: {
                video_id: id,
                num: segments,
            },
        });
    },
};

const share = {
    // 我分享的
    my: (): Promise<ShareResponse> => instance.get("/share/from"),
    // 分享给我的
    others: (): Promise<ShareResponse> => instance.get("/share/to"),
    add: (userId: number) => instance.post(`share/add?user_id=${userId}`),
    remove: (shareId: number) =>
        instance.delete(`/share/delete?share_id=${shareId}`),
    video: (userID: number): Promise<GetAllVideosResponse> =>
        instance.get("/video/share", { params: { user_id: userID } }),
};

const process = {
    start: (
        videoId: number,
        x: number,
        y: number,
        width: number,
        height: number,
    ) =>
        instance.get("/video/start", {
            params: {
                video_id: videoId,
                x,
                y,
                width,
                height,
            },
        }),
    stop: (videoId: number) =>
        instance.get("/video/stop", {
            params: {
                video_id: videoId,
            },
        }),
    list: (ids: number[]) =>
        instance.post("/video/startlist", {
            ids,
        }),
};
export type faceMethod = "codeformer" | "restoreformer";
const enhance = {
    face: (
        files: Array<File | undefined>,
        method: faceMethod,
    ): Promise<{ results: string[]; method: faceMethod }> => {
        const formData = new FormData();
        files.forEach((image) => {
            if (image !== undefined) {
                formData.append(`files`, image, image.name);
            }
        });
        formData.append(`method`, method);
        return instance.post(`/v1/enhance/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

const log = (): Promise<LogResponse> => instance.get("/log");
const alglog = (): Promise<LogResponse> => instance.get("process_log");
const storage = (): Promise<StorageResponse> => instance.get("/storage");
const rpcConfig = (): Promise<RpcConfigResponse> => instance.get("/rpc_config");
const statusStatistics = (): Promise<ServerStatusStatisticsResponse> =>
    instance.get("/server_status/statistics");

const task = {
    // 获取任务列表，支持时间筛选
    list: (
        startTime?: string,
        endTime?: string,
    ): Promise<TasksResponse> => {
        const params: Record<string, string> = {};
        if (startTime) params.start_time = startTime;
        if (endTime) params.end_time = endTime;
        return instance.get("task/get", { params });
    },
    add: (taskName: string, owner: number) =>
        instance.post("/task/add", { TaskName: taskName, Owner: owner }),
    delete: (taskId: number) =>
        instance.delete("/task/delete", { params: { task_id: taskId } }),
    get: (taskId: number): Promise<TaskResponse> =>
        instance.get("/task/get_by_id", { params: { task_id: taskId } }),
    events: (task_id: number): Promise<TaskEventsResponse> =>
        instance.get("video/events_task?", {
            params: {
                task_id,
            },
        }),
    bigpicTotal: (
        task_id: number,
        genre: urlPicGenre,
        tag_id: number | undefined,
        start_time: Dayjs | undefined = undefined,
        end_time: Dayjs | undefined = undefined,
        keywords: string | undefined = undefined,
        sort_field_id: number | undefined = 0,
        image: File | null = null,
        face_quality_threshold: number = 20,
        clarity_quality_threshold: number = 100,
        videoId: number,
    ): Promise<{ Message: string; Data: number }> => {
        const start = start_time
            ? start_time.format("YYYY-MM-DD HH:mm:ss")
            : undefined;
        const end = end_time
            ? end_time.format("YYYY-MM-DD HH:mm:ss")
            : undefined;

        const event_task_num_url =
            genre === "gif" ? "gif_events_num_task" : "events_num_task";

        const formData = new FormData();
        if (image) formData.append("image", image);
        return instance.request({
            url: `video/${event_task_num_url}`,
            method: "post",
            params: {
                task_id,
                tag_id,
                start_time: start,
                end_time: end,
                // 图片检索由后端直接调用 SearchImage；避免把旧文本条件和图片条件意外取交集。
                keywords: image ? undefined : keywords,
                sort_field_id,
                face_quality_threshold,
                clarity_quality_threshold,
                videoId,
            },
            data: formData, // ✅ 仅包含 image
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    bigpicPage: (
        task_id: number,
        genre: urlPicGenre,
        tag_id: number | undefined,
        index: number,
        size: number,
        sortorder: number,
        start_time: Dayjs | undefined = undefined,
        end_time: Dayjs | undefined = undefined,
        keywords: string | undefined = undefined,
        sort_field_id: number | undefined = 0,
        image: File | null = null,
        face_quality_threshold: number = 20,
        clarity_quality_threshold: number = 100,
        videoId = -1,
    ): Promise<BigPicPageRes> => {
        const start = start_time
            ? start_time.format("YYYY-MM-DD HH:mm:ss")
            : undefined;
        const end = end_time
            ? end_time.format("YYYY-MM-DD HH:mm:ss")
            : undefined;

        const events_url = genre === "gif" ? "gif_events_task" : "events_task";

        const formData = new FormData();
        if (image) formData.append("image", image); // ✅ 仅包含 image 字段

        return instance.request({
            method: "post",
            url: `video/${events_url}`,
            params: {
                task_id,
                tag_id,
                index,
                size,
                sort_order_id: sortorder,
                start_time: start,
                end_time: end,
                // 选择图片时使用图片检索，文本条件不再参与本次请求。
                keywords: image ? undefined : keywords,
                sort_field_id,
                face_quality_threshold,
                clarity_quality_threshold,
                videoId,
            },
            data: formData, // ✅ 非标准但你服务端如果支持就可行
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    threePic: async (eId: number): Promise<AdditionImgRes> => {
        console.log("In threepic request: event id is ", eId);
        // return new Promise((r) => {
        //     setTimeout(() => {
        //         r({
        //             Message: "",
        //             Data: {
        //                 originalSrc:
        //                     "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070&auto=format&fit=crop",
        //                 faceSrc:
        //                     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
        //                 bodySrc: `https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=2070&auto=format&fit=crop`,
        //                 bbox: { x: 0.42, y: 0.35, w: 0.08, h: 0.15 },
        //             },
        //         });
        //     }, 500);
        // });
        return instance.request({
            method: "post",
            url: `video/threepic`,
            params: {
                eId,
            },
        });
    },
};

const chat = {
    chat: (
        prompt: string,
        task_id: string | undefined,
        chatId: number | undefined = undefined,
    ) => {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("task_id", task_id ?? "-1");
        if (chatId !== undefined) {
            formData.append("id", chatId.toString());
        }
        const response = fetch("/qwen/chat", {
            method: "POST",
            body: formData,
            headers: {
                token: localStorage.getItem("token") || "",
                Accept: "text/event-stream",
            },
        });
        return response;
    },
    allChatHistory: async (
        taskId: string | undefined,
    ): Promise<HistoryItem[]> => {
        const res = await fetch(
            `/qwen/history_list?task_id=${taskId || "-1"}`,
            {
                method: "GET",
                headers: {
                    token: localStorage.getItem("token") || "",
                },
            },
        );

        if (!res.ok) {
            await handleFetchError(res);
        }

        const data: HistoryItem[] = await res.json();
        return data;
    },
    oneChatHistory: async (chatId: number): Promise<ChatHistory> => {
        const res = await fetch(`/qwen/history/${chatId}`, {
            method: "GET",
            headers: {
                token: localStorage.getItem("token") || "",
            },
        });

        if (!res.ok) {
            await handleFetchError(res);
        }

        const data: ChatHistory = await res.json();
        return data;
    },
    deleteChatHistory: async (
        chatId: number,
    ): Promise<{
        status: number;
        id: number;
    }> => {
        const res = await fetch(`/qwen/delete/${chatId}`, {
            method: "DELETE",
            headers: {
                token: localStorage.getItem("token") || "",
            },
        });

        if (!res.ok) {
            await handleFetchError(res);
        }

        const data = await res.json();
        return data;
    },
};

const online = {
    allPeopleCountSv(): Promise<AllSvInfo> {
        return instance.get("video/online/strategy/channels?strategy_id=0");
    },
    getChannelsByGroupId(groupId: string | number): Promise<AllSvInfo> {
        return instance.get(
            `video/online/strategy/channels?strategy_id=${groupId}`,
        );
    },
    getWebRtc(device_id: string, channel_id: string): Promise<GetWebrtcSrcRes> {
        return instance.get(
            `video/online/stream?device_id=${device_id}&channel_id=${channel_id}`,
        );
    },
    getPeopleCount(
        device_id: string,
        channel_id: string,
        start_time: Date,
        end_time: Date,
        interval: number,
    ): Promise<GetPeopleCountRes> {
        return instance.get("video/online/people_flow/get", {
            params: {
                device_id,
                channel_id,
                start_time: dayjs(start_time).format("YYYY-MM-DD HH:mm:ss"),
                end_time: dayjs(end_time).format("YYYY-MM-DD HH:mm:ss"),
                interval,
            },
        });
    },

    startPc(device_id: string, channel_id: string, lines: FlowLine[]) {
        return instance.post("video/online/people_flow/start", {
            line_points_entrance: [
                convertFlowlineToNumberArr(lines[0]),
                convertFlowlineToNumberArr(lines[1]),
                convertFlowlineToNumberArr(lines[2]),
            ],
            line_points_direction_in2out: convertFlowlineToNumberArr(lines[3]),
            device_id,
            channel_id,
        });
    },
    stopPc(device_id: string, channel_id: string) {
        return instance.post("video/online/people_flow/stop", {
            device_id,
            channel_id,
        });
    },
    getAllGroups(): Promise<GetAllGroupsRes> {
        return instance.get("video/online/groups");
    },

    getCertainGroups(
        group_id: string,
        index: number,
        size: number,
    ): Promise<AllSvInfo> {
        return instance.get("video/online/group/channels", {
            params: {
                group_id,
                index,
                size,
            },
        });
    },

    addStrategies(svIds: number[], svStrategies: svStrategyId[]) {
        return instance.post("/video/online/add_strategies", {
            ids: svIds,
            strategies: svStrategies,
        });
    },
    delStrategies(svIds: number[], svStrategies: svStrategyId[]) {
        return instance.post("video/online/del_strategies", {
            ids: svIds,
            strategies: svStrategies,
        });
    },

    tableData(
        device_ids: string[],
        channel_ids: string[],
    ): Promise<TableDataRes> {
        if (device_ids.length === 0 || channel_ids.length === 0) {
            return Promise.resolve({
                Message:
                    "Human Made No Data because of device and channel ids is empty",
                Data: [],
            });
        }
        return instance.post("video/online/people_flow/form", {
            device_ids,
            channel_ids,
        });
    },

    getAlertData(params: {
        group_id: number | string;
        video_id: number | string;
        strategy_id: number;
        start_time: Date | null;
        end_time: Date | null;
        index: number;
        size: number;
        status: string;
    }): Promise<AlertDataRes> {
        const {
            group_id,
            video_id,
            strategy_id,
            start_time,
            end_time,
            index,
            size,
            status,
        } = params;

        // 发起请求
        return instance.get("/video/online/alarm/get", {
            params: {
                group_id,
                video_id,
                strategy_id,
                start_time: start_time
                    ? dayjs(start_time).format("YYYY-MM-DD HH:mm:ss")
                    : null,
                end_time: end_time
                    ? dayjs(end_time).format("YYYY-MM-DD HH:mm:ss")
                    : null,

                index,
                size,
                status,
            },
        });
    },
    getSearchData(params: {
        group_id: number | string;
        video_id: number | string;
        evtType: EventType;
        keywords: string;
        start_time: Date | null;
        end_time: Date | null;
        index: number;
        size: number;
    }): Promise<SearchDataRes> {
        const {
            group_id,
            video_id,
            evtType,
            keywords,
            start_time,
            end_time,
            index,
            size,
        } = params;

        // 发起请求
        return instance.get("/video/online/search", {
            params: {
                group_id,
                video_id,
                evtType,
                keywords,
                start_time: start_time
                    ? dayjs(start_time).format("YYYY-MM-DD HH:mm:ss")
                    : null,
                end_time: end_time
                    ? dayjs(end_time).format("YYYY-MM-DD HH:mm:ss")
                    : null,
                index,
                size,
            },
        });
    },

    confirmAlert(alert_id: number) {
        return instance.post(`video/online/alarm/handle?alarm_id=${alert_id}`);
    },

    ignoreAlert(alert_id: number) {
        return instance.post(`/video/online/alarm/ignore?alarm_id=${alert_id}`);
    },
    updateStrategies(svId: string | number, strategiesID: number[]) {
        return instance.post(`/video/online/update_strategies`, {
            id: Number(svId),
            strategies: strategiesID,
        });
    },

    getPeopleCountSummary(
        groupId: number,
        start_time: Date,
        end_time: Date,
        interval: number,
    ): Promise<GetPeopleCountSummaryRes> {
        return instance.get("/video/online/people_flow/group", {
            params: {
                group_id: groupId,
                start_time: dayjs(start_time).format("YYYY-MM-DD HH:mm:ss"),
                end_time: dayjs(end_time).format("YYYY-MM-DD HH:mm:ss"),
                interval,
            },
        });
    },
    async getAllSv(): Promise<AllSvRes> {
        const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 一天
        const CACHE_KEY = "channels_cache"; // 唯一的缓存键
        // 1. 尝试从 localStorage 中获取缓存
        const cachedDataString = localStorage.getItem(CACHE_KEY);
        if (cachedDataString) {
            try {
                const cachedObject = JSON.parse(cachedDataString);
                const now = new Date().getTime();

                // 2. 检查缓存是否过期
                if (now < cachedObject.expiry) {
                    console.log("✅ 命中缓存，返回缓存数据。");
                    // 缓存未过期，直接返回 Promise.resolve(数据)
                    // 注意：需要确保返回的结构和 axios.get 的 data 结构一致
                    return Promise.resolve(cachedObject.data);
                } else {
                    // 缓存已过期，清除旧缓存
                    console.log("❌ 缓存已过期，执行清除。");
                    localStorage.removeItem(CACHE_KEY);
                }
            } catch (e) {
                console.error("解析缓存数据失败:", e);
                localStorage.removeItem(CACHE_KEY); // 解析失败也清除
            }
        }

        // 3. 缓存未命中或已过期，发起新的请求
        console.log("缓存未命中或过期，发起新的 API 请求。");
        const res: AllSvRes = await instance.get("/video/online/channels");
        // 4. 请求成功，更新缓存
        const now = new Date().getTime();
        const cacheObject = {
            data: res, // 假设实际数据在 response.data 中
            expiry: now + CACHE_EXPIRY_MS, // 设定新的过期时间
        };

        // 注意：存储 5M 的大对象可能会在某些浏览器中接近 localStorage/localStorage 的容量限制
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
        } catch (e) {
            console.warn("存储缓存失败，可能超出存储限制 (5M/10M)。", e);
        }
        return res;
    },
    async algSetGroup(data: DeploymentData) {
        return instance.post("/video/online/task/add", data);
    },
    async validSvChoose(groupName: string, groupMonitorIds: number[]) {
        return instance.post("/video/online/valid-choose", {
            groupName,
            groupMonitorIds,
        });
    },
    async deleteGroup(groupId: number) {
        return instance.delete(`/video/online/task/del?group_id=${groupId}`);
    },
};

export const api = {
    user,
    video,
    player,
    share,
    enhance,
    process,
    log,
    alglog,
    storage,
    rpcConfig,
    statusStatistics,
    task,
    chat,
    online,
    caption,
};

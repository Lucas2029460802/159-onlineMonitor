import { urlCurEvtType } from "@/pages/bigpic";
import { EvtType } from "@/pages/video-player/components/events-type";
import { TASK_FILTER_ALL, taskFilterAll } from "@/pages/videos";

export type LengthSelector = "alllength" | "halfhour" | "1hour" | "2hour";

export enum TaskStatus {
    ERROR = 0,
    PROCESSING = 1,
    WAITING = 2,
    COMPLETED = 3,
    TRANSCODING = 4,
    UNPROCESSED = 5,
    TRANSCODEFAILED = 6,
}

export enum UserRoles {
    Admin = 0,
    User = 1,
    Other = 2,
}

export enum TaskType {
    Other = 0,
    Indoor = 1,
    Doorway = 2,
    Road = 3,
}

export const TaskStatusString: { [key in TaskStatus]: string } = {
    [TaskStatus.ERROR]: "异常错误",
    [TaskStatus.PROCESSING]: "处理中",
    [TaskStatus.WAITING]: "队列中",
    [TaskStatus.COMPLETED]: "已完成",
    [TaskStatus.TRANSCODING]: "转码中",
    [TaskStatus.UNPROCESSED]: "待处理",
    [TaskStatus.TRANSCODEFAILED]: "转码失败",
};

export const TaskTypeString: { [key in TaskType]: string } = {
    [TaskType.Other]: "其他",
    [TaskType.Indoor]: "室内",
    [TaskType.Doorway]: "门洞",
    [TaskType.Road]: "马路",
};

export interface TimeEvent {
    start_time: number;
    num: number;
}

export interface Thumbnails {
    total_num: number;
    thumbnail_list: {
        filename: string;
        url: string;
        time: number;
        completed: TaskStatus;
        progress: number;
        time_rest: number;
    }[];
}

export interface EventsInfoRes {
    total_time: number;
    split: number;
    info: TimeEvent[];
    processed_time: number;
}
export type TimeEventsRes = {
    ScreenShot: string;
    StartTime: number;
    EndTime: number;
    Event: string;
    Method: string;
}[];

export const LengthSelectorKeyMap = new Map<LengthSelector, number | undefined>(
    [
        ["1hour", 3600],
        ["2hour", 7200],
        ["halfhour", 1800],
        ["alllength", undefined],
    ],
);

export function string2TaskStatus(
    statusString: string | null,
): TaskStatus | TASK_FILTER_ALL {
    const status = TaskStatus[statusString as keyof typeof TaskStatus];

    if (statusString === taskFilterAll.toString()) return taskFilterAll;

    if (status === undefined || status === null) {
        return taskFilterAll;
    }

    return Number(statusString);
}

export type VideoInfo = {
    Message: string;
    Data: {
        Name: string;
        UploadTime: string;
        Duration: number;
    };
};
export type AllEventsInfo = {
    Meassage: string;
    Data: {
        processed_time: number;
        total_time: number;
        roi?: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
        BaseTime?: Date;
        FrameRate: number;
        MotionRatio: number;
        Resolution: string;
        TotalFrame: number;
        Events: EventInfo[];
        CarEventList: CertainEvtInfo[];
        OtherEventList: CertainEvtInfo[];
        PersonEventList: CertainEvtInfo[];
    };
};

export type CertainEvtInfo = {
    ScreenShot: string;
    Time: string;
    End: number;
    Start: number;
    ScreenShotIndex: number | undefined;
    TagId: number;
};

export type EventInfo = {
    EndTime: number;
    Event: string;
    Method: string;
    ScreenShot: string;
    StartTime: number;
    Tag: {
        Person: 0 | 1;
        Bike: 0 | 1;
        Car: 0 | 1;
        Other: 0 | 1;
    };
};

export type EventStatistics = {
    Message: string;
    Data: {
        split: number;
        info: {
            StartTime: number;
            Num: number;
        }[];
    };
};

export interface BaseResponse {
    Message: string;
}

export type UserRole = 0 | 1 | 2;
export interface User {
    Id: number;
    Name: string;
    Role: UserRole;
    Station: string;
}
export interface LoginResponse extends BaseResponse {
    Data: User;
}

export interface GetAllUserResponse extends BaseResponse {
    Data: User[];
}

export interface Video {
    Id: number;
    Name: string;
    StartTime: Date;
    EndTime: Date;
    UploadTime: Date;
    Duration: number;
    ViewPath: string;
    Status: TaskStatus;
    Owner: number;
    FilePath: string;
    EventPath: string;
    TimeProcessed: number;
    AlgorithmProcessingDurationMs?: number;
    AlgorithmQueueDurationMs?: number;
    BackendQueueDurationMs?: number;
    EventCount?: number;
    TimeRest: number;
    Progress: number;
}

export interface GetAllVideosResponse extends BaseResponse {
    Data: Video[] | null;
}

export interface Share {
    Id: number;
    From: User;
    To: User;
    ShareTime: Date;
}

export interface ShareResponse extends BaseResponse {
    Data: Share[] | null;
}

export interface VideoExistResponse extends BaseResponse {
    Data: boolean;
}

export interface LogResponse extends BaseResponse {
    Data?: string;
}

export interface StorageResponse extends BaseResponse {
    Data?: {
        Total: number;
        Used: number;
        Free: number;
        UsedPercent: number;
    };
}

export interface SizeResponse extends BaseResponse {
    Data: number;
}

export interface RpcConfigResponse extends BaseResponse {
    Data: Record<string, unknown> | null;
}

export interface PlatformStatistics {
    compatibleBrowserVersion: number;
    processingVideoCount: number;
    waitingVideoCount: number;
    taskTotal: number;
    videoTotal: number;
    videoDurationSec: number;
    eventTotal: number;
    eventBreakdown: {
        person: number;
        car: number;
        bike: number;
        other: number;
    };
    eventTrend: {
        date: string;
        count: number;
    }[];
    bootTime: Date;
}

export interface ServerStatusStatisticsResponse extends BaseResponse {
    Data: PlatformStatistics | null;
}

export interface SizeAggregateResponse extends BaseResponse {
    Data: {
        [key in TaskStatus]: number;
    };
}

export interface Task {
    Id: number;
    TaskName: string;
    Owner: number;
    CreateTime: Date;
}

export interface TasksResponse extends BaseResponse {
    Data: Task[];
}
export interface TaskResponse extends BaseResponse {
    Data: Task;
}
export interface UpdateTimeResponse extends BaseResponse {
    Message: string;
    Data: object;
}
export interface GifEvtInfo {
    Gif: string;
    Time: string;
    end: number;
    start: number;
}

export interface TaskEvent {
    BaseTime: Date;
    CarEventList: CertainEvtInfo[];
    FrameRate: number;
    OtherEventList: CertainEvtInfo[];
    PersonEventList: CertainEvtInfo[];
    Gif_events: GifEvtInfo[];
    VideoId: number;
}
export interface TaskEventsResponse {
    Message: string;
    Data: TaskEvent[];
}

export const type2BackendTagID = new Map<urlCurEvtType, number | undefined>([
    ["all", -1],
    ["person", 0],
    ["car", 1],
    ["other", 2],
    ["bike", 3],
    ["face", 4],
] as [urlCurEvtType, number | undefined][]);

export interface BigPicGifEvtInfo {
    Gif: string;
    Time: string;
    End: number;
    Start: number;
}
export interface BigPicPagePerRes {
    BaseTime: Date;
    FrameRate: number;
    Events: {
        End: number;
        Id: number;
        ScreenShot: string;
        ScreenShotIndex: number;
        Start: number;
        TagId: number;
        Time: string;
        VideoId: number;
        TextScore: number;
        Caption: string;
        HitString: string;
    }[];
    GifEvents: BigPicGifEvtInfo[] | null;
    videoId: number;
}
export interface BigPicPageRes {
    Message: string;
    Data: {
        list: BigPicPagePerRes[] | null;
        total: number;
    };
}

export interface ChatHistory {
    id: number;
    title: string;
    messages: ChatMessage[];
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: MessageContent[];
}

export type MessageContent =
    | {
          type: "text";
          text: string;
      }
    | {
          type: "image";
          image: string;
      };

export type TimeObj = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
};

// 对于监控，单个监控的全部信息
export type CertainSvInfo = {
    Id: number;
    device_id: string;
    parent_id: string;
    view_path: string;
    name: string;
    manufacturer: string;
    model: string;
    owner: string;
    civil_code: string;
    address: string;
    port: number;
    secrecy: number;
    ip_address: string;
    status: "ON" | "OFF";
    longitude: number;
    latitude: number;
    info: {
        ptz_type: number;
        resolution: string;
        download_speed: string;
    };
    group_id: number;
    group_name: string;
    appliedStrategies: number[];
    people_flow_status: boolean;
    line_points_entrance: [[number, number], [number, number]][] | null;
    line_points_out_in2out: [[number, number], [number, number]] | null;
    /** 用户暂停设置：running / paused。与摄像头 status（ON/OFF）不是同一字段。 */
    state?: ChannelLifecycleState;
};

export type AllSvInfo = {
    Message: string;
    Data: CertainSvInfo[];
};

export type GetWebrtcSrcRes = {
    Message: string;
    Data: string;
};

export type SampleStat = {
    sample_index: number;
    start_time: Date;
    end_time: Date;
    in_count: number;
    out_count: number;
};

export type PeopleCountStats = {
    total_in: number;
    total_out: number;
    sample_stats: SampleStat[];
};

export type GetPeopleCountRes = {
    Message: string;
    Data: PeopleCountStats;
};

export type ChannelLifecycleState = "running" | "paused";

export type ChannelRuntimeStatus =
    | "pausing"
    | "paused"
    | "started"
    | "running"
    | "stopped"
    | "stream_release_pending"
    | "unknown";

export type GroupSettingState = "running" | "paused" | "mixed" | "empty";

/** 暂停/恢复接口确认的单通道结果。state 是数据库设置，status 是本次运行情况。 */
export type ChannelLifecycleResult = {
    id: number;
    state?: ChannelLifecycleState;
    status?: ChannelRuntimeStatus;
    error?: string;
};

export type ChannelLifecycleRes = {
    Message: string;
    Data: ChannelLifecycleResult;
};

export type GroupLifecycleResult = {
    group_id?: number;
    channels?: ChannelLifecycleResult[];
    failed?: ChannelLifecycleResult[];
};

export type GroupLifecycleRes = {
    Message: string;
    Data: GroupLifecycleResult;
};

export type GroupInfo = {
    Id: number;
    Name: string;
    Num: number;
    /** 用户设置汇总，不是健康状态 */
    state?: GroupSettingState;
    running_count?: number;
    paused_count?: number;
};
export type GetAllGroupsRes = {
    Message: string;
    Data: GroupInfo[];
};

export type CertainSvInfoRes = {
    Message: string;
    Data: CertainSvInfo;
};

export type TableData = {
    device_id: string;
    channel_id: string;
    last_hour_in: number;
    last_hour_out: number;
    last_day_in: number;
    last_day_out: number;
    last_month_in: number;
    last_month_out: number;
    all_in: number;
    all_out: number;
};

export type TableDataRes = {
    Message: string;
    Data: TableData[];
};

export enum Deal_Status {
    all = -1,
    not = 0,
    dealt = 1,
}
export type AlertOne = {
    id: number;
    time: Date;
    url: string;
    location: string;
    strategy_id: number;
    status: Deal_Status; // -1 全部 0：未处理 1：已处理
    video_id: number;
    caption: string;
};
export type AlertDataRes = {
    Message: "";
    Data: {
        total: number;
        list: AlertOne[];
    };
};

export type SearchOne = {
    id: number;
    time: Date;
    url: string;
    location: string;
    hitString: string;
    type: EvtType;
    /** 动图事件标识，见 API.md online event */
    event_type?: string;
    event_id?: string;
    segment_id?: string;
    folderId?: number;
    caption?: string;
    tag?: string[];
    start?: number;
    end?: number;
    instances?: string[];
    metadata_url?: string;
};

export type SearchMediaGenre = "png" | "gif";

/** 实时监测列表适配后的卡片项（动图一行一事件；静态展平 instances） */
export type SearchCardItem = {
    key: string;
    imagePath: string;
    event: SearchOne;
    instanceIndex?: number;
};

export type SearchDataRes = {
    Message: "";
    Data: {
        total: number;
        list: SearchOne[];
    };
};

export type GetPeopleCountSummaryRes = {
    Message: string;
    Data: PeopleCountStats & {
        today_in: 0;
        today_out: 0;
        current_people: 115;
        history_peak: 131;
    };
};

export type oneSv = {
    Id: number;
    name: string;
    keyboard_number: string;
    device_id: string;
    parent_id: string;
    view_path: string;
};
export type AllSvRes = {
    Message: string;
    Data: oneSv[];
};

export type AdditionImgRes = {
    Message: string;
    Data: AdditionImgInfo;
};
export type AdditionImgInfo = {
    originalSrc: string;
    faceSrc: string;
    bodySrc: string;
    bbox: { x: number; y: number; w: number; h: number } | null;
};

export type ROI = {
    x: number;
    y: number;
    w: number;
    h: number;
};

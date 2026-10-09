export interface PeopelCountInChart {
    time: string;
    enterCount: number;
    exitCount: number;
}

// 定义策略 id ↔ name 映射表
export const strategyMap = {
    0: "人流监测",
    1: "奇装异服",
    // 2: "打架斗殴",
    // 3: "跪拜检测",
    // 4: "人群聚集",
    // 5: "交通事故",
    // 6: "明火可见",
    // 7: "吸烟可见",
    // 8: "手持摄录设备",
    // 9: "悬挂条幅",
    10: "实时监测",
    99999: "未知名字的策略",
} as const;
export enum STRATEGYID {
    SEARCH = 10,
}
export const strategyReverseMap = Object.fromEntries(
    Object.entries(strategyMap).map(([k, v]) => [v, Number(k)]),
) as Record<
    (typeof strategyMap)[keyof typeof strategyMap],
    keyof typeof strategyMap
>;
// 推导出类型
export type svStrategyId = keyof typeof strategyMap;
export type svStrategy = (typeof strategyMap)[keyof typeof strategyMap];
export const strategyNamesArr = Object.values(strategyMap) as svStrategy[];
export type SurveillanceCameraInfo = {
    svId: string;
    name: string;
    isActivated: boolean;
    appliedStrategies: svStrategy[];
    snapshotSrc: string;
    groups: string[];
    groupNames: string[];
    device_id: string;
    channel_id: string;
    people_flow_status: boolean;
    line_points_entrance: [[number, number], [number, number]][] | null; // 3条线
    line_points_out_in2out: [[number, number], [number, number]] | null;
};

import { SurveillanceCameraInfo } from ".";

export const mockSvInfo: SurveillanceCameraInfo[] = [
    {
        svId: "sv-1",
        name: "复活岛路口摄像头-前门",
        isActivated: true,
        appliedStrategies: ["人流检测", "刀具检测"],
        snapshotSrc: "/api/video/image?image_path=04000001637000400.jpeg",
        groups: ["复活岛"],
    },
    {
        svId: "sv-2",
        name: "复活岛路口摄像头-后门1",
        isActivated: false,
        appliedStrategies: ["人流检测", "火灾检测"],
        snapshotSrc: "/api/video/image?image_path=04000001637000200.jpeg",
        groups: ["复活岛"],
    },
    {
        svId: "sv-3",
        name: "复活岛路口摄像头-后门2",
        isActivated: false,
        appliedStrategies: ["火灾检测"],
        snapshotSrc: "/api/video/image?image_path=04000001590000100.jpeg",
        groups: ["复活岛"],
    },
    {
        svId: "sv-4",
        name: "复活岛路口摄像头-后门3",
        isActivated: false,
        appliedStrategies: ["人流检测", "火灾检测"],
        snapshotSrc: "/api/video/image?image_path=04000001590000000.jpeg",
        groups: ["复活岛"],
    },
    {
        svId: "sv-5",
        name: "杨浦-复活岛交界路口摄像头-1",
        isActivated: false,
        appliedStrategies: ["火灾检测"],
        snapshotSrc: "/api/video/image?image_path=04000001581000200.jpeg",
        groups: ["复活岛", "杨浦区"],
    },
    {
        svId: "sv-6",
        name: "杨浦-复活岛交界路口摄像头-2",
        isActivated: false,
        appliedStrategies: ["人流检测", "火灾检测"],
        snapshotSrc: "/api/video/image?image_path=04000001581000000.jpeg",
        groups: ["复活岛", "杨浦区"],
    },
    {
        svId: "sv-7",
        name: "杨浦体育馆路口摄像头-2",
        isActivated: false,
        appliedStrategies: ["火灾检测"],
        snapshotSrc: "/api/video/image?image_path=04000001637000400.jpeg",
        groups: ["杨浦区"],
    },
];

// 模拟后端返回的数据结构
const mockChartData = {
    hour: [
        { time: "10:00", enterCount: 20, exitCount: 15 },
        { time: "11:00", enterCount: 30, exitCount: 25 },
        { time: "12:00", enterCount: 25, exitCount: 30 },
        { time: "13:00", enterCount: 40, exitCount: 35 },
        { time: "14:00", enterCount: 35, exitCount: 40 },
    ],
    week: [
        { time: "周一", enterCount: 100, exitCount: 80 },
        { time: "周二", enterCount: 120, exitCount: 90 },
        { time: "周三", enterCount: 90, exitCount: 100 },
        { time: "周四", enterCount: 150, exitCount: 130 },
        { time: "周五", enterCount: 140, exitCount: 120 },
        { time: "周六", enterCount: 180, exitCount: 160 },
        { time: "周日", enterCount: 200, exitCount: 180 },
    ],
    month: [
        { time: "1日", enterCount: 300, exitCount: 250 },
        { time: "5日", enterCount: 350, exitCount: 300 },
        { date: "10日", enterCount: 320, exitCount: 280 },
        { time: "15日", enterCount: 400, exitCount: 350 },
        { time: "20日", enterCount: 380, exitCount: 330 },
        { time: "25日", enterCount: 450, exitCount: 400 },
        { time: "30日", enterCount: 500, exitCount: 450 },
    ],
};

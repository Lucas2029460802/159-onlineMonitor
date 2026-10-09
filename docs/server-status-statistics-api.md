# 数据中台统计接口文档

## 接口说明

用于 `server-status` 页面中 `StatisticsPanel` 的真实数据展示，提供数据统计区所需的浏览器适配版本、视频处理队列、任务/视频/事件汇总、事件趋势和事件类别分布。

当前页面其它区域已分别使用现有接口：

- 日志：`GET /api/log`、`GET /api/process_log`
- 存储占用：`GET /api/storage`
- 算法端配置：`GET /api/rpc_config`

本接口只负责“数据统计”模块。

## 请求

```http
GET /api/server_status/statistics
```

### 请求参数

暂无。

后续如需支持时间范围，可扩展：

| 参数       | 类型   | 必填 | 说明                        |
| ---------- | ------ | ---- | --------------------------- |
| start_date | string | 否   | 开始日期，格式 `YYYY-MM-DD` |
| end_date   | string | 否   | 结束日期，格式 `YYYY-MM-DD` |

## 响应结构

```ts
interface ServerStatusStatisticsResponse {
    Message: string;
    Data: PlatformStatistics;
}

interface PlatformStatistics {
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
    bootTime: string;
}
```

## 字段说明

| 字段                     | 类型   | 说明                                                            |
| ------------------------ | ------ | --------------------------------------------------------------- |
| compatibleBrowserVersion | number | 系统适配的最低浏览器内核版本，当前前端展示为 `>=103`            |
| processingVideoCount     | number | 当前正在处理的视频数量                                          |
| waitingVideoCount        | number | 当前等待处理的视频数量                                          |
| taskTotal                | number | 平台任务总数                                                    |
| videoTotal               | number | 平台视频总数                                                    |
| videoDurationSec         | number | 视频总时长，单位秒                                              |
| eventTotal               | number | 累计识别事件数量                                                |
| eventBreakdown.person    | number | 人员事件数量                                                    |
| eventBreakdown.car       | number | 车辆事件数量                                                    |
| eventBreakdown.bike      | number | 非机动车事件数量                                                |
| eventBreakdown.other     | number | 其它事件数量                                                    |
| eventTrend[].date        | string | 趋势图横轴日期，建议格式 `MM-DD`                                |
| eventTrend[].count       | number | 对应日期的事件数量                                              |
| bootTime                 | string | 系统启动时间，ISO 8601 字符串，例如 `2026-05-09T10:18:56+08:00` |

## 响应示例

```json
{
    "Message": "success",
    "Data": {
        "compatibleBrowserVersion": 103,
        "processingVideoCount": 7,
        "waitingVideoCount": 19,
        "taskTotal": 36,
        "videoTotal": 482,
        "videoDurationSec": 311114,
        "eventTotal": 12863,
        "eventBreakdown": {
            "person": 6231,
            "car": 3845,
            "bike": 1492,
            "other": 1295
        },
        "eventTrend": [
            {
                "date": "05-09",
                "count": 1342
            },
            {
                "date": "05-10",
                "count": 1567
            },
            {
                "date": "05-11",
                "count": 1820
            },
            {
                "date": "05-12",
                "count": 1430
            },
            {
                "date": "05-13",
                "count": 2105
            },
            {
                "date": "05-14",
                "count": 1985
            },
            {
                "date": "05-15",
                "count": 2614
            }
        ],
        "bootTime": "2026-05-09T10:18:56+08:00"
    }
}
```

## 前端对接说明

前端已通过 `api.statusStatistics()` 请求该接口，并将 `Data` 传给 `<StatisticsPanel data={statistics} />`。

接口失败或 `Data` 为空时，页面会直接显示错误/空数据提示，不再使用 mock 数据兜底。

注意：当前 axios 响应拦截器会把 ISO 日期字符串自动转换为 `Date` 对象，因此后端 `bootTime` 推荐返回标准 ISO 字符串。

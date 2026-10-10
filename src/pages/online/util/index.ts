import { FlowLine } from "../people-count/components/DrawPopup";
import {
    PeopelCountInChart,
    strategyMap,
    SurveillanceCameraInfo,
    svStrategy,
    svStrategyId,
} from "../types";

import { CertainSvInfo, SampleStat } from "@/api/type";

export function convertCertainSvInfo2SvInfo(
    c: CertainSvInfo,
): SurveillanceCameraInfo {
    return {
        svId: c.Id.toString(),
        name: c.name,
        isActivated: c.status === "ON",
        appliedStrategies: c.appliedStrategies
            ? c.appliedStrategies.map(mapStrategyId2Name)
            : [],
        snapshotSrc: c.view_path,
        groups: [c.group_id.toString()], // 用数组是怕以后单个channel属于多个组
        groupNames: [c.group_name],
        device_id: c.parent_id, //  上级的id
        channel_id: c.device_id, // 自己的id
        line_points_entrance: c.line_points_entrance,
        line_points_out_in2out: c.line_points_out_in2out,
        people_flow_status: c.people_flow_status,
        channelState:
            c.state === "paused" || (c as { State?: string }).State === "paused"
                ? "paused"
                : "running",
    };
}

// id -> name
export function mapStrategyId2Name(strategyId: number): svStrategy {
    return (
        strategyMap[strategyId as keyof typeof strategyMap] ?? "未知名字的策略"
    );
}

// name -> id
export function mapStrategyName2Id(name: svStrategy): svStrategyId {
    const res = Object.entries(strategyMap).find(([, v]) => v === name)?.[0] as
        | svStrategyId
        | undefined;
    return res ? (Number(res) as svStrategyId) : (99999 as svStrategyId);
}

export function mapPc2Formate(
    src: SampleStat,
    period: "hour" | "week" | "month",
): PeopelCountInChart {
    const pad = (n: number) => n.toString().padStart(2, "0");

    // ✅ 将 UTC 时间转为北京时间
    const utcDate = new Date(src.end_time);
    const bjDate = new Date(utcDate.getTime());

    let time: string;

    if (period === "hour") {
        // 小时粒度 -> HH:mm
        time = `${pad(bjDate.getHours())}:${pad(bjDate.getMinutes())}`;
    } else {
        // 周/月粒度 -> MM-DD
        time = `${pad(bjDate.getMonth() + 1)}-${pad(bjDate.getDate())}`;
    }

    return {
        time,
        enterCount: src.in_count,
        exitCount: src.out_count,
    };
}

export function getTimeRangeByPeriod(
    now: Date,
    period: "hour" | "week" | "month",
) {
    switch (period) {
        case "hour":
            return {
                past: new Date(now.getTime() - 3600 * 1000),
                interval: 300,
            };
        case "week":
            return {
                past: new Date(now.getTime() - 7 * 24 * 3600 * 1000),
                interval: 24 * 3600,
            };
        case "month":
            return {
                past: new Date(now.getTime() - 30 * 24 * 3600 * 1000),
                interval: 3 * 24 * 3600,
            };
    }
}

// ✅ 通用画线函数
export function drawLine(
    ctx: CanvasRenderingContext2D,
    line: FlowLine,
    step: number,
    isTemp = false,
    shrink = false,
) {
    const { start, end } = line;
    const color =
        step === 1
            ? isTemp
                ? "rgba(0,0,255,0.3)"
                : "rgba(0,0,255,0.7)"
            : isTemp
              ? "rgba(255,0,0,0.3)"
              : "rgba(255,0,0,0.7)";

    ctx.strokeStyle = color;
    ctx.lineWidth = shrink ? 4 : 12;
    ctx.beginPath();
    ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
    ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
    ctx.stroke();

    // 第二步时画箭头
    if (step === 2) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const x0 = start.x * w;
        const y0 = start.y * h;
        const x1 = end.x * w;
        const y1 = end.y * h;

        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        // 单位方向向量
        const ux = dx / len;
        const uy = dy / len;

        // 箭头参数（可调）
        const arrowLength = shrink ? 25 : 100; // 箭头长度
        const arrowWidth = shrink ? 15 : 60; // 箭头底边宽度

        // 箭头顶点（终点）
        const arrowTipX = x1;
        const arrowTipY = y1;

        // 箭头底边中心点
        const baseX = x1 - ux * arrowLength;
        const baseY = y1 - uy * arrowLength;

        // 垂直向量（用来确定底边两点）
        const perpX = -uy * (arrowWidth / 2);
        const perpY = ux * (arrowWidth / 2);

        // 画三角形
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(arrowTipX, arrowTipY);
        ctx.lineTo(baseX + perpX, baseY + perpY);
        ctx.lineTo(baseX - perpX, baseY - perpY);
        ctx.closePath();
        ctx.fill();
    }
}

export function convertNumberArrToFlowline(
    n: [[number, number], [number, number]],
): FlowLine {
    const [[x1, y1], [x2, y2]] = n;
    return {
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
    };
}
export function convertFlowlineToNumberArr(
    f: FlowLine,
): [[number, number], [number, number]] {
    return [
        [f.start.x, f.start.y],
        [f.end.x, f.end.y],
    ];
}

export function ceilDateMinutes(date: Date, minuteInterval = 10): Date {
    const d = new Date(date); // 拷贝原始日期
    const minutes = d.getMinutes();

    // 计算向上取整的分钟数
    const roundedMinutes = Math.ceil(minutes / minuteInterval) * minuteInterval;

    // 如果超过 60 分钟，需要进位到小时
    if (roundedMinutes >= 60) {
        d.setHours(d.getHours() + 1);
        d.setMinutes(0);
    } else {
        d.setMinutes(roundedMinutes);
    }

    // 秒和毫秒归零
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d;
}

export function drawHexagon(
    ctx: CanvasRenderingContext2D,
    lines: FlowLine[],
    fillColor = "rgba(0, 0, 255, 0.4)",
    strokeColor = "rgba(0, 0, 255, 0.8)",
    shrink = false,
) {
    if (lines.length !== 3) {
        console.warn("drawHexagon requires exactly 3 FlowLines.");
        return;
    }

    // 1️⃣ 收集所有6个点（标准化到canvas坐标）
    const points = lines.flatMap((line) => [
        {
            x: line.start.x * ctx.canvas.width,
            y: line.start.y * ctx.canvas.height,
        },
        {
            x: line.end.x * ctx.canvas.width,
            y: line.end.y * ctx.canvas.height,
        },
    ]);

    // 2️⃣ 计算几何中心
    const centroid = points.reduce(
        (acc, p) => ({ x: acc.x + p.x / 6, y: acc.y + p.y / 6 }),
        { x: 0, y: 0 },
    );

    // 3️⃣ 按与中心点的极角排序，保证六边形连线顺序正确
    points.sort((a, b) => {
        const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
    });

    // 4️⃣ 绘制六边形
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = shrink ? 3 : 6;

    ctx.fill();
    ctx.stroke();
}

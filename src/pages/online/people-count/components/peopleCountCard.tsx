import { Col, Row, Statistic, Tooltip } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import CountUp from "react-countup";

import PeopleCountChart from "./PeopleCountChart";
import PeopleCountDraw from "./peopleCountDraw";
import TimePeriodSelector from "./TimePeriodSelector";
import WebRTCPlayer from "./webtrcplayer";
import {
    PeopelCountInChart,
    SurveillanceCameraInfo,
} from "../../types";
import {
    ceilDateMinutes,
    getTimeRangeByPeriod,
    mapPc2Formate,
} from "../../util";

import { api } from "@/api";
import { IconClose } from "@/assets/svg";
import { $PC } from "@/store/peoplecount";

interface PeopleCountCardProps {
    data: SurveillanceCameraInfo | null;
    handleClose: (selectedTreeIds: string[]) => void;
}

const PeopleCountCard = ({ data, handleClose }: PeopleCountCardProps) => {
    const hasSignal = !!data;
    const [timePeriod, setTimePeriod] = useState<"hour" | "week" | "month">(
        "hour",
    );
    const [loading, setLoading] = useState(false);
    const [chartData, setChardData] = useState<PeopelCountInChart[]>([]);
    const [historyNum, setHistoryNum] = useState<{ in: number; out: number }>({
        in: 0,
        out: 0,
    });
    const histroyNumRef = useRef<{ in: number; out: number }>({
        in: 0,
        out: 0,
    });
    useEffect(() => {
        setHistoryNum(histroyNumRef.current);
    }, [histroyNumRef.current]);
    const prevHistoryNum = useRef<{ in: number; out: number }>({
        in: 0,
        out: 0,
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    // 请求webtrc源
    const [webrtcSrc, setWebRtcSrc] = useState<string>("");
    useEffect(() => {
        const load = async () => {
            if (!data) {
                setChardData([]);
                histroyNumRef.current = { in: 0, out: 0 };
                prevHistoryNum.current = { in: 0, out: 0 };

                return;
            }
            const res = await api.online.getWebRtc(
                data.device_id,
                data.channel_id,
            );
            setWebRtcSrc(res.Data);
        };
        load();
    }, [data]);

    const hourInterval = useRef<number>(-1);
    // 请求人流
    useEffect(() => {
        const load = async () => {
            if (!data) return;
            const ceilNow = ceilDateMinutes(new Date(), 5);
            const { past, interval } = getTimeRangeByPeriod(
                ceilNow,
                timePeriod,
            );
            setLoading(true);
            const res = await api.online.getPeopleCount(
                data.device_id,
                data.channel_id,
                past,
                ceilNow,
                interval,
            );
            const newData = res.Data.sample_stats.map((s) =>
                mapPc2Formate(s, timePeriod),
            );
            setChardData(newData);
            prevHistoryNum.current = { in: historyNum.in, out: historyNum.out };
            histroyNumRef.current = {
                in: res.Data.total_in,
                out: res.Data.total_out,
            };

            if (timePeriod === "hour") {
                hourInterval.current = setInterval(async () => {
                    const ceilNow = ceilDateMinutes(new Date(), 5);
                    const { past, interval } = getTimeRangeByPeriod(
                        ceilNow,
                        timePeriod,
                    );
                    const res = await api.online.getPeopleCount(
                        data.device_id,
                        data.channel_id,
                        past,
                        ceilNow,
                        interval,
                    );
                    const newData = res.Data.sample_stats.map((s) =>
                        mapPc2Formate(s, timePeriod),
                    );
                    setChardData(newData);
                    prevHistoryNum.current = {
                        in: histroyNumRef.current.in,
                        out: histroyNumRef.current.out,
                    };
                    histroyNumRef.current = {
                        in: res.Data.total_in,
                        out: res.Data.total_out,
                    };
                }, 2000);
            }

            setLoading(false);
        };
        load();
        return () => {
            clearInterval(hourInterval.current);
        };
    }, [data, timePeriod]);

    const rightContainer = useMemo(() => {
        return (
            <div className="w-90 flex flex-shrink-0  justify-center items-center flex-col relative">
                <div className="w-full aspect-video relative rounded-lg overflow-hidden bg-black">
                    {hasSignal ? (
                        <WebRTCPlayer
                            className="w-full h-full object-cover"
                            videoRef={videoRef}
                            url={webrtcSrc}
                            svInfo={data}
                            // muted
                            loop
                            peopleNum={historyNum}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-lg">
                            无信号
                        </div>
                    )}
                </div>
            </div>
        );
    }, [data, hasSignal, webrtcSrc, historyNum]);

    return (
        <div className="rounded-xl  w-max py-4 px-5 max-h-90 bg-white shadow-md relative">
            {hasSignal && (
                <div
                    className="absolute top-2 right-3 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                        if (!data) return;
                        const nowTreeSelected = [...$PC.get().selectedTreeIds];
                        const curTreeId = `${data.groups[0]}%${data.svId}`;
                        const afterDeleted = nowTreeSelected.filter(
                            (item) => item !== curTreeId,
                        );
                        //还需要删除treeID
                        handleClose(afterDeleted);
                        $PC.update("关闭通道", (p) => {
                            p.selectedTreeIds = afterDeleted;
                        });
                    }}
                >
                    <Tooltip title="关闭查看">
                        <IconClose></IconClose>
                    </Tooltip>
                </div>
            )}
            <div className="flex justify-between items-center mb-1">
                <Row gutter={24} className="w-full">
                    <Col span={14} className="flex">
                        <div className="flex  items-center text-2xl font-bold h-full">
                            {hasSignal ? data!.name : "等待选择通道"}
                            {hasSignal ? (
                                <div className="w-25 min-w-25 flex justify-end px-2 font-normal">
                                    <PeopleCountDraw
                                        videoRef={videoRef}
                                        data={data}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </Col>
                    <Col span={5}>
                        <Statistic
                            title="历史总进入"
                            valueRender={() => (
                                <CountUp
                                    start={prevHistoryNum.current.in}
                                    end={historyNum.in}
                                    duration={1} // 动画时长 1 秒
                                    separator=","
                                />
                            )}
                        />
                    </Col>
                    <Col span={5}>
                        <Statistic
                            title="历史总离开"
                            valueRender={() => (
                                <CountUp
                                    start={prevHistoryNum.current.out}
                                    end={historyNum.out}
                                    duration={1}
                                    separator=","
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
            <div className="flex gap-2">
                {/* 下左侧：人流统计图表 */}
                <div className="flex flex-col w-[346px]">
                    <TimePeriodSelector
                        value={timePeriod}
                        onChange={(s) => {
                            setTimePeriod(s);
                            clearInterval(hourInterval.current);
                        }}
                    />

                    <div className="flex-1">
                        {loading ? (
                            <div className="w-[346px] h-[192px] flex items-center justify-center text-gray-400">
                                加载中...
                            </div>
                        ) : (
                            <PeopleCountChart
                                data={chartData}
                                xAxisKey="time"
                            />
                        )}
                    </div>
                </div>

                {/* 下右侧：视频区 */}
                {rightContainer}
            </div>
        </div>
    );
};

export default PeopleCountCard;

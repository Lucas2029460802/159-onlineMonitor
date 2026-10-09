import { useMemo } from "react";

import { calcTime } from "../util";
import VideoTagItem from "./videotag-item";

import { AllEventsInfo } from "@/api/type";

interface VideoTagProps {
    allEvent: AllEventsInfo;
}
export default function VideoTag({ allEvent }: VideoTagProps) {
    const carEventsNum = useMemo(() => {
        return allEvent.Data.CarEventList.length;
    }, [allEvent]);
    const peopleEventsNum = useMemo(() => {
        return allEvent.Data.PersonEventList.length;
    }, [allEvent]);
    const otherEventsNum = useMemo(() => {
        return allEvent.Data.OtherEventList.length;
    }, [allEvent]);

    const compressRatio = useMemo(() => {
        return (
            100 -
            (100 * allEvent.Data.processed_time) /
                (allEvent.Data.total_time + 1e-3)
        ).toFixed(2);
    }, [allEvent]);

    return (
        <div
            id="dml-tag-container"
            className="pb-1.5 mt-4 mb-5 border-b border-[#E3E5E7]"
        >
            <div id="dml-tag-panel">
                <VideoTagItem
                    title="事件总数"
                    num={carEventsNum + peopleEventsNum + otherEventsNum}
                />
                <VideoTagItem
                    title="压缩后时长"
                    num={calcTime(allEvent.Data.processed_time)}
                />
                <VideoTagItem title="压缩率" num={`${compressRatio}%`} />
                {allEvent.Data.BaseTime === undefined && (
                    <VideoTagItem title="OCR未能成功识别监控时间" num={""} />
                )}
                <VideoTagItem title="人事件" num={peopleEventsNum} />
                <VideoTagItem title="车辆事件" num={carEventsNum} />
                <VideoTagItem title="其它事件" num={otherEventsNum} />
            </div>
        </div>
    );
}

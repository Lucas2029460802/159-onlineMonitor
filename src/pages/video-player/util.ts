import { VideoStatus } from "./common";
import { EvtType, evtTypeMap } from "./components/events-type";

import { CertainEvtInfo, EventInfo, EventStatistics } from "@/api/type";

export function clamp(number: number, min: number, max: number) {
    if (number < min) {
        return min;
    } else {
        return Math.min(number, max);
    }
}
export function calcPercent(number: number, min: number, max: number) {
    return (number - min) / (max - min + 1e-6);
}

export function calcTime(estimated: number | undefined): string {
    if (estimated !== undefined) {
        const hours = Math.floor(estimated / 3600);
        const minutes = Math.floor((estimated % 3600) / 60);
        const seconds = Math.floor(estimated % 60);
        const minAndSec = [minutes, seconds]
            .map((unit) => String(unit).padStart(2, "0"))
            .join(":");
        if (hours === 0) {
            return minAndSec;
        } else {
            return `${hours}:${minAndSec}`;
        }
    }
    return "计算中...";
}
export function close2Zero(num: number) {
    return Math.abs(num) <= 1e-6;
}
type StausAndID = {
    status: VideoStatus;
    videoID: number;
};
export function GetVideoStatusAndID(searchParams: URLSearchParams): StausAndID {
    const idInURL = searchParams.get("id");
    const isNumber = (str: string) => /^-?\d+(\.\d+)?$/.test(str);
    if (idInURL === null || idInURL === "" || !isNumber(idInURL)) {
        return {
            status: VideoStatus.IDInvalid,
            videoID: -1,
        };
    } else {
        return {
            status: VideoStatus.Loading,
            videoID: Number(idInURL),
        };
    }
}

export function filterEventsByTag(
    events: CertainEvtInfo[],
    curEvtType: EvtType,
) {
    return curEvtType === EvtType.All
        ? events
        : events.filter((item) => {
              if (curEvtType === EvtType.Car) {
                  return item.TagId === 1;
              } else if (curEvtType === EvtType.Other) {
                  return item.TagId === 2;
              } else if (curEvtType === EvtType.Person) {
                  return item.TagId === 0;
              }
              return true;
          });
}

export function allEvts2Statistics(
    totalTime: number,
    events: CertainEvtInfo[],
    curEvtType: EvtType,
    frameRate: number,
): EventStatistics {
    const segTime = totalTime >= 3600 ? 10 : totalTime / 360;
    const segNum = Math.ceil(totalTime / segTime);
    let lastTime = 0;
    let evtIdx = 0;
    const res = [];
    // console.log("allevts2", events);
    const filterd = filterEventsByTag(events ?? [], curEvtType);
    // console.log("filter", filterd);
    for (let segIndex = 0; segIndex < segNum; segIndex++) {
        const segStartTime = lastTime;
        const segEndTime = lastTime + segTime;
        let segEvtNums = 0;
        for (; evtIdx < filterd.length; evtIdx++) {
            const startTime = filterd[evtIdx].Start / frameRate;
            if (startTime >= segStartTime && startTime < segEndTime) {
                segEvtNums++;
            } else {
                break;
            }
        }
        res.push({ StartTime: segStartTime, Num: segEvtNums });
        lastTime = segEndTime;
    }
    return {
        Message: "",
        Data: {
            split: segNum,
            info: res,
        },
    };
}

export function getCurEvtLists(
    person: CertainEvtInfo[],
    other: CertainEvtInfo[],
    car: CertainEvtInfo[],
    eventType: EvtType,
) {
    let evts = [];
    if (eventType === EvtType.Person) {
        evts = person;
    } else if (eventType === EvtType.Car) {
        evts = car;
    } else if (eventType === EvtType.Other) {
        evts = other;
    } else {
        // AllEvent 的情况
        evts = [...person, ...car, ...other].sort((a, b) => a.Start - b.Start);
    }
    return evts;
}

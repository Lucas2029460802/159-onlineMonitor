import { ceilDateMinutes, getTimeRangeByPeriod } from ".";

import { api } from "@/api";

export async function reqeustSummaryData(group_id: number, timeStamp: number) {
    const ceilNow = ceilDateMinutes(new Date(), 5);
    const { past, interval } = getTimeRangeByPeriod(ceilNow, "hour");
    const res = await api.online.getPeopleCountSummary(
        group_id,
        past,
        ceilNow,
        interval,
    );
    return res;
}

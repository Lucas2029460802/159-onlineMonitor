import { FilterTarget } from "..";
import { strategyNamesArr } from "../../types";
import { AlertCardProps } from "../components/AlertCard";
import { FilterOptions } from "../components/Filter";

export const groupOptions = [
    { value: "all", label: "全部组别" },
    { value: "0", label: "杨浦区体育馆" },
    { value: "1", label: "复活岛" },
];
export const channelOptions = [
    { value: "all", label: "全部监控" },
    { value: "channle1", label: "channle1" },
    { value: "channle2", label: "channle2" },
];

export type AlertResponse = {
    total: number;
    data: AlertCardProps[];
};

export function mockGetGroupOptions(): Promise<FilterOptions> {
    return new Promise((res) => {
        setTimeout(
            () => {
                res(groupOptions);
            },
            500 + 1000 * Math.random(),
        );
    });
}
export function mockGetChannelOptions(groupId: string): Promise<FilterOptions> {
    return new Promise((res) => {
        setTimeout(
            () => {
                const a = [...channelOptions];
                if (groupId === "1") {
                    a.pop();
                } else if (groupId === "0") {
                    a.splice(1, 1);
                }
                res(a);
            },
            500 + 1000 * Math.random(),
        );
    });
}

export function mockGetAlertItems(t: FilterTarget): Promise<AlertResponse> {
    const {
        groupId,
        channelId,
        strategyId,
        dealt,
        startTime,
        endTime,
        page,
        size,
    } = t;
    console.log(
        `请求AlertCard数据时的参数 groupId: ${groupId}, channelId: ${channelId}, strategyId: ${strategyId}, dealt: ${dealt}`,
    );
    console.log(
        `请求AlertCard数据时的参数 startTime: ${startTime}, endTime: ${endTime}, page: ${page}, size: ${size}`,
    );

    return new Promise((res) => {
        setTimeout(
            () => {
                const a = {
                    total: 125,
                    data: [],
                } as {
                    total: number;
                    data: AlertCardProps[];
                };
                a.data = Array(page === 6 ? 5 : 20)
                    .fill({
                        id: 1,
                        time: new Date(),
                        location: "邯郸路220号嘻嘻哈哈叽叽喳喳",
                        strategy:
                            strategyNamesArr[
                                Math.floor(
                                    1 +
                                        Math.random() *
                                            (strategyNamesArr.length - 2),
                                )
                            ],
                        dealt: true,
                    })
                    .map((item, index) => ({
                        ...item,
                        id: index + "a",
                        dealt: Math.random() < 0.5,
                    }));

                res(a);
            },
            500 + 500 * Math.random(),
        );
    });
}

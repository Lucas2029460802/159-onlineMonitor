import { useEffect, useRef, useState } from "react";
export interface fetchRes<T> {
    loading: boolean;
    data: T | null;
}

// function deepCompare(a: any, b: any, needLog: boolean = false) {
//     // 必须是同一类型
//     if (needLog) console.log("dc", a, b, a === b);

//     if (typeof a !== typeof b) return false;
//     if (typeof a !== "object" || a === null) {
//         // 值元素和null直接比较
//         return a === b;
//     }
//     // // Date 特殊比较,Date没有keys，所以如果不单独判断，并按照下方比较object的逻辑会误认两个Date相等
//     // if (a instanceof Date) {
//     //     return a === b;
//     // }
//     // 此时是两个对象
//     const keysA = Object.keys(a);
//     const keysB = Object.keys(b);
//     if (keysA.length !== keysB.length) return false;
//     for (const key of keysA) {
//         if (!keysB.includes(key)) return false;
//         if (needLog) console.log("对象比较", "key:", key);
//         if (!deepCompare(a[key], b[key], needLog)) return false;
//     }
//     return true;
// }
export function deepCompare(a: any, b: any, needLog: boolean = false): boolean {
    if (needLog) console.log("dc", a, b);
    if (a === b) return true;

    // 类型不同直接 false
    if (typeof a !== typeof b) return false;

    // Date 比较
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    // 处理 null 或基本类型
    if (typeof a !== "object" || a === null || b === null) {
        return a === b;
    }

    // 对象比较(数组也算)
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(
        (key) => keysB.includes(key) && deepCompare(a[key], b[key]),
    );
}

export function useFetch<T>(
    needLog: boolean = false,
    queryMethod: (...args: any[]) => Promise<T>,
    ...queryParams: Parameters<typeof queryMethod>
) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<T | null>(null);
    const lastParams = useRef<Parameters<typeof queryMethod> | null>(null);
    useEffect(() => {
        const dc = deepCompare(lastParams.current, queryParams, needLog);
        if (needLog) {
            console.log(
                "请求方法名字",
                queryMethod.name,
                "之前参数",
                lastParams.current,
                "现在参数",
                queryParams,
            );
        }
        if (needLog) console.log("对比结果是否一致", dc);
        if (dc) {
            if (needLog) {
                console.debug("结果一致或者参数为null", "跳过请求");
            }
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            console.log("提前", queryMethod.name, lastParams.current);
            const response = await queryMethod(...queryParams);
            console.log("结束", queryMethod.name);

            setData(response);
            setLoading(false);
        };
        lastParams.current = queryParams;
        fetchData();
    }, [needLog, queryMethod, queryParams]);
    return { loading, data };
}

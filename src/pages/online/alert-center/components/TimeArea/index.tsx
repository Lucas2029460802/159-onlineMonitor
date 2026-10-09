import { ConfigProvider, DatePicker } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
const { RangePicker } = DatePicker;
interface TimeAreaFilterProps {
    typeName: string;
    typeClassName?: string;
    TimeClassName?: string;
    onChange: (a: Date | null, b: Date | null) => void;
    startTime: Date | null;
    endTime: Date | null;
}
export default function TimeAreaFilter(props: TimeAreaFilterProps) {
    return (
        <div className=" flex items-center justify-start gap-3">
            <div
                className={twMerge(
                    "text-center px-[13px] text-[14px] border-r-1 border-r-[#c9ccd0] text-[#61666d]",
                    props.typeClassName ?? "w-15",
                )}
            >
                {props.typeName}
            </div>
            <ConfigProvider locale={zhCN}>
                <RangePicker
                    showTime
                    value={
                        props.startTime && props.endTime
                            ? [dayjs(props.startTime), dayjs(props.endTime)]
                            : null
                    }
                    onChange={(a) => {
                        if (!a || !a[0] || !a[1]) {
                            props.onChange(null, null);
                        } else {
                            props.onChange(
                                new Date(a[0].toDate()), // 包裹一层new Date防止strict mode造成更新时间不重新请求数据的问题
                                new Date(a[1].toDate()),
                            );
                        }
                    }}
                />
            </ConfigProvider>
        </div>
    );
}

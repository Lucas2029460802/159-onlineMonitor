import "@ant-design/v5-patch-for-react-19";
import { DatePicker, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";

import "./time-picker.css";
const { RangePicker } = DatePicker;
import "dayjs/locale/zh-cn";
import { TimeRange } from "./grid";
interface RangeTimePickerProps {
    setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
    value?: TimeRange;
}
export const RangeTimePicker: React.FC<RangeTimePickerProps> = ({
    setTimeRange,
    value,
}: RangeTimePickerProps) => {
    const disabledDate = (current: dayjs.Dayjs | null): boolean => {
        const today = dayjs();
        return current !== null && current > today;
    };
    return (
        <ConfigProvider locale={zhCN}>
            <RangePicker
                showTime
                className="text-center"
                value={value && value[0] && value[1] ? value : undefined}
                onChange={(times) => {
                    if (times && times[0] && times[1]) {
                        setTimeRange([times[0], times[1]]);
                    } else {
                        setTimeRange([undefined, undefined]);
                    }
                }}
                onFocus={() => {}}
                disabledDate={disabledDate}
            />
        </ConfigProvider>
    );
};
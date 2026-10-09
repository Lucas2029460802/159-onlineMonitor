import { useState } from "react";

import { api } from "@/api";
import { IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
import { Message } from "@/util/ui";

export interface SetVideoTimeProps {
    vid: number;
    onClose: () => void;
    onRefresh: () => void;
}

interface TimeInputProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    required?: boolean;
}

function TimeInput({
    label,
    value,
    onChange,
    placeholder,
    min,
    max,
    required,
}: TimeInputProps) {
    return (
        <div className="flex items-center">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm w-20"
                placeholder={placeholder}
                min={min}
                max={max}
                required={required}
            />
            <span className="ml-1 text-gray-700">{label}</span>
        </div>
    );
}

export default function SetVideoTime({
    vid,
    onClose,
    onRefresh,
}: SetVideoTimeProps) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [day, setDay] = useState(now.getDate());
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0); // 秒默认0
    const handleSubmit = async () => {
        const timeObj = {
            year,
            month,
            day,
            hour,
            minute,
            second,
        };
        const res = await api.video.updateTime(vid, timeObj);
        if (res.Message === "") {
            Message.success("未报错", "视频时间设置成功");
            onRefresh();
            onClose();
        } else {
            Message.danger("报错", res.Message);
        }
    };

    return (
        <Popup show className="w-[800px] bg-white border-0 rounded-lg">
            {/* header */}
            <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between">
                <div className="text-blue-2 font-medium">
                    手动设置视频内容起始时间
                </div>
                <IconClose
                    className="text-lg text-gray-2 cursor-pointer"
                    onClick={() => {
                        onClose();
                    }}
                />
            </div>

            {/* content */}
            <div className="px-8 py-6">
                <div className="flex flex-wrap gap-4">
                    <TimeInput
                        label="年"
                        value={year}
                        onChange={setYear}
                        required
                    />
                    <TimeInput
                        label="月"
                        value={month}
                        onChange={setMonth}
                        min={1}
                        max={12}
                        required
                    />
                    <TimeInput
                        label="日"
                        value={day}
                        onChange={setDay}
                        min={1}
                        max={31}
                        required
                    />
                    <TimeInput
                        label="时"
                        value={hour}
                        onChange={setHour}
                        min={0}
                        max={23}
                        required
                    />
                    <TimeInput
                        label="分"
                        value={minute}
                        onChange={setMinute}
                        min={0}
                        max={59}
                        required
                    />
                    <TimeInput
                        label="秒"
                        value={second}
                        onChange={setSecond}
                        min={0}
                        max={59}
                    />
                </div>

                <div className="text-sm text-gray-500 mt-4">
                    提示：视频对应的结束时间将会根据手动填写的上传时间和视频时长自动计算，因此无需填写
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-blue-1 bg-blue-1 text-white rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#00b5e5] hover:border-[#00b5e5]"
                        onClick={handleSubmit}
                    >
                        提交上传
                    </button>
                </div>
            </div>
        </Popup>
    );
}

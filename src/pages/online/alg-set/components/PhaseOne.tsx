// --- 建立布控组（默认实时监测，一步提交） ---

import { Button, ConfigProvider, Form, Input } from "antd";
import { useMemo, useState } from "react";

import { api } from "@/api";
import { oneSv } from "@/api/type";
import {
    IconRealtime,
    IconSearch,
    IconSetAlg,
    IconSurveillance,
} from "@/assets/svg";

const theme = {
    token: {
        colorPrimary: "#00aeec",
        borderRadius: 10,
        controlHeight: 40,
        controlHeightLG: 44,
    },
};

function channelMeta(monitor: oneSv) {
    return [monitor.keyboard_number, monitor.device_id]
        .filter(Boolean)
        .join(" · ");
}

function ChannelPicker({
    monitors,
    value = [],
    onChange,
    id,
}: {
    monitors: oneSv[];
    value?: number[];
    onChange?: (ids: number[]) => void;
    id?: string;
}) {
    const { status, errors } = Form.Item.useStatus();
    const [keyword, setKeyword] = useState("");
    const selected = useMemo(() => new Set(value), [value]);
    const filtered = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        if (!query) return monitors;
        return monitors.filter((monitor) =>
            [monitor.name, monitor.keyboard_number, monitor.device_id]
                .filter(Boolean)
                .some((text) => text.toLowerCase().includes(query)),
        );
    }, [keyword, monitors]);

    const toggle = (monitorId: number) => {
        if (selected.has(monitorId)) {
            onChange?.(value.filter((id) => id !== monitorId));
            return;
        }
        onChange?.([...value, monitorId]);
    };

    const selectFiltered = () => {
        const next = new Set(value);
        filtered.forEach((monitor) => next.add(monitor.Id));
        onChange?.([...next]);
    };

    const invalid = status === "error";

    return (
        <section
            id={id}
            className={`h-full min-h-0 rounded-2xl bg-white border flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${
                invalid ? "border-[#fb2c36]" : "border-[#eef1f4]"
            }`}
        >
            <div className="px-5 pt-5 pb-4 border-b border-[#f0f2f4]">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-base font-medium text-text-4">
                            监控资源
                        </div>
                        <div className="mt-1 text-xs text-text-2">
                            已选 {value.length} / {monitors.length} 路
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            disabled={filtered.length === 0}
                            onClick={selectFiltered}
                            className="text-xs text-[#00a1d6] hover:text-[#0086b3] disabled:text-text-2 disabled:cursor-not-allowed"
                        >
                            全选
                        </button>
                        <button
                            type="button"
                            disabled={value.length === 0}
                            onClick={() => onChange?.([])}
                            className="text-xs text-text-1 hover:text-text-4 disabled:text-text-2 disabled:cursor-not-allowed"
                        >
                            清空
                        </button>
                    </div>
                </div>
                <Input
                    allowClear
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="搜索通道名称、编号或设备"
                    prefix={<IconSearch className="w-3.5 h-3.5 text-text-2" />}
                    className="mt-4"
                />
                {invalid && (
                    <div className="mt-2 text-xs text-[#fb2c36]">
                        {errors[0]}
                    </div>
                )}
            </div>

            <div className="@container flex-1 min-h-0 overflow-y-auto p-3">
                {monitors.length === 0 && (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-text-2">
                        <IconSurveillance className="w-10 h-10 opacity-40" />
                        <div className="mt-3 text-sm">暂无可布控通道</div>
                    </div>
                )}
                {monitors.length > 0 && filtered.length === 0 && (
                    <div className="h-full min-h-[200px] flex items-center justify-center text-sm text-text-2">
                        没有匹配的监控
                    </div>
                )}
                {filtered.length > 0 && (
                    <div className="grid grid-cols-1 @min-[560px]:grid-cols-2 gap-2">
                        {filtered.map((monitor) => {
                            const active = selected.has(monitor.Id);
                            const meta = channelMeta(monitor);
                            return (
                                <button
                                    key={monitor.Id}
                                    type="button"
                                    onClick={() => toggle(monitor.Id)}
                                    className={`text-left rounded-xl border px-3.5 py-3 transition-colors ${
                                        active
                                            ? "border-[#00aeec] bg-[#f4fbfe]"
                                            : "border-[#eef1f4] bg-[#fbfcfd] hover:border-[#b7e7f7] hover:bg-white"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`mt-0.5 w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${
                                                active
                                                    ? "bg-[#00aeec] border-[#00aeec] text-white"
                                                    : "border-[#c9ccd0] bg-white"
                                            }`}
                                        >
                                            {active && (
                                                <svg
                                                    viewBox="0 0 12 12"
                                                    className="w-2.5 h-2.5"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M2.2 6.1 4.7 8.6 9.8 3.4"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-text-4 truncate">
                                                {monitor.name}
                                            </span>
                                            {meta && (
                                                <span className="block mt-0.5 text-xs text-text-2 truncate">
                                                    {meta}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export const PhaseOne = ({
    allMonitors,
    submitting,
    onSubmit,
}: {
    allMonitors: oneSv[];
    submitting: boolean;
    onSubmit: (data: {
        groupName: string;
        groupMonitorIds: number[];
    }) => void | Promise<void>;
}) => {
    const [form] = Form.useForm();
    const selectedIds =
        (Form.useWatch("groupMonitorIds", form) as number[] | undefined) ?? [];

    const handleSubmit = async () => {
        let values;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }
        try {
            await api.online.validSvChoose(
                values.groupName,
                values.groupMonitorIds,
            );
            await onSubmit({
                groupName: values.groupName,
                groupMonitorIds: values.groupMonitorIds,
            });
        } catch {
            // validSvChoose / 提交失败由 axios 或上层提示
        }
    };

    return (
        <ConfigProvider theme={theme}>
            <div className="h-full min-h-0 p-4">
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ groupName: "", groupMonitorIds: [] }}
                    className="h-full"
                >
                    <div className="h-full min-h-0 grid grid-cols-[minmax(320px,38%)_minmax(0,1fr)] grid-rows-1 gap-4">
                        <section className="h-full min-h-0 rounded-2xl bg-white border border-[#eef1f4] shadow-[0_10px_30px_rgba(15,23,42,0.05)] flex flex-col overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-[#6366f1] to-[#00aeec]" />
                            <div className="p-5 flex flex-col gap-4 flex-1 min-h-0">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#f4fbfe] text-[#00aeec] flex items-center justify-center shrink-0">
                                        <IconSetAlg className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-lg font-semibold text-text-4 leading-tight">
                                            建立布控组
                                        </h1>
                                        <p className="mt-1 text-xs leading-5 text-text-2">
                                            填写名称并选择右侧通道，提交后开启实时监测。
                                        </p>
                                    </div>
                                </div>
                                <Form.Item
                                    label={
                                        <span className="text-sm font-medium text-text-4">
                                            布控组名称
                                        </span>
                                    }
                                    name="groupName"
                                    className="!mb-0"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入布控组名称",
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="例如：西区商场安全布控组"
                                        size="large"
                                    />
                                </Form.Item>

                                <div className="rounded-2xl border border-[#d7f1fb] bg-[linear-gradient(160deg,#f7fcff_0%,#eef7ff_100%)] p-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-white text-[#00aeec] shadow-sm flex items-center justify-center shrink-0">
                                            <IconRealtime className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-text-4">
                                                    实时监测
                                                </span>
                                                <span className="text-[11px] leading-5 px-1.5 rounded-full bg-white text-[#00a1d6] border border-[#c8eef9]">
                                                    默认
                                                </span>
                                            </div>
                                            <div className="text-xs text-text-2 mt-0.5">
                                                人车检测
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2.5 text-xs leading-5 text-text-1">
                                        提交后直接开启，无需第二阶段配置。
                                    </p>
                                </div>

                                <div className="mt-auto pt-1">
                                    <div className="mb-3 flex items-center justify-between text-xs text-text-2">
                                        <span>本次布控</span>
                                        <span>{selectedIds.length} 路监控</span>
                                    </div>
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        loading={submitting}
                                        onClick={handleSubmit}
                                        className="!h-11 !rounded-xl !font-medium"
                                    >
                                        确认创建布控
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <Form.Item
                            name="groupMonitorIds"
                            noStyle
                            rules={[
                                {
                                    required: true,
                                    message: "请至少选择一个监控",
                                },
                            ]}
                        >
                            <ChannelPicker monitors={allMonitors} />
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
};

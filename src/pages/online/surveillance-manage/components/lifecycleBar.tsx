import { groupSettingText } from "../lifecycle";

import { GroupInfo } from "@/api/type";

type LifecycleBarProps = {
    group?: GroupInfo;
};

export default function LifecycleBar({ group }: LifecycleBarProps) {
    const settingText = groupSettingText(group?.state);
    if (!settingText) return null;

    return (
        <div className="flex flex-wrap items-center gap-[10px] py-2.5 text-sm">
            <span className="text-[13px] text-[#61666d]">
                {settingText}
                {group?.running_count !== undefined &&
                    group.paused_count !== undefined &&
                    `（运行 ${group.running_count}，暂停 ${group.paused_count}）`}
                。这是用户设置汇总；暂停与恢复请在单个通道菜单中操作。
            </span>
        </div>
    );
}

export function LifecycleNote() {
    return (
        <details className="mb-4 rounded-lg bg-[#f6f7f8] px-4 py-3 text-[13px] text-[#61666d] leading-6">
            <summary className="cursor-pointer text-[#18191c] font-medium select-none">
                暂停与恢复说明
            </summary>
            <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                    暂停与恢复按单个通道执行，不会影响同组其他通道。请在监控卡片菜单中操作。
                </li>
                <li>
                    暂停保留通道、所属组、算法配置、人流坐标和历史记录，并停止录制与重连。当前片段处理完后释放资源。暂停期间的画面不会补录。
                </li>
                <li>
                    恢复使用原通道和原分组重新申请实时流，并创建新的录制会话。
                </li>
                <li>
                    数据库设置只有运行和暂停。「已暂停」要等进程确认停止后才显示。收尾中、流释放待重试、无法确认会分别标出。
                </li>
                <li>
                    「运行中」表示 Worker
                    进程还在。摄像头是否有画面、模型是否加载完成，需要另行确认。
                </li>
                <li>含人流监测或其他旧版实时算法的通道，不能按原配置暂停。</li>
                <li>删除本组仍然是删除。暂停请使用通道菜单中的暂停操作。</li>
            </ul>
        </details>
    );
}

import { groupSettingText } from "../lifecycle";

import { GroupInfo } from "@/api/type";
import { IconPause, IconStart } from "@/assets/svg";

type LifecycleBarProps = {
    group?: GroupInfo;
    busy: boolean;
    onPauseGroup: () => void;
    onResumeGroup: () => void;
};

export default function LifecycleBar({
    group,
    busy,
    onPauseGroup,
    onResumeGroup,
}: LifecycleBarProps) {
    const empty = group?.state === "empty" || group?.Num === 0;
    const disabled = busy || empty || !group;
    const settingText = groupSettingText(group?.state);

    return (
        <div className="flex flex-wrap items-center gap-[10px] py-2.5 text-sm">
            <button
                type="button"
                disabled={disabled}
                onClick={onPauseGroup}
                className="hover:opacity-90 w-35 px-[1px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center text-white bg-[#e68600] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <IconPause className="h-3/5 mr-2" />
                <span>暂停本组</span>
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={onResumeGroup}
                className="hover:opacity-90 w-35 px-[1px] h-8 rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center text-white bg-[#00aeec] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <IconStart className="h-3/5 mr-2" />
                <span>恢复本组</span>
            </button>
            {settingText && (
                <span className="text-[13px] text-[#61666d]">
                    {settingText}
                    {group?.running_count !== undefined &&
                        group.paused_count !== undefined &&
                        `（运行 ${group.running_count}，暂停 ${group.paused_count}）`}
                    。这是用户设置汇总。
                </span>
            )}
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
                    每个通道可以单独暂停或恢复。本组操作逐通道执行；恢复本组会包含此前单独暂停的通道。
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
                <li>删除本组仍然是删除。暂停请使用这里的暂停操作。</li>
            </ul>
        </details>
    );
}

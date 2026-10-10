import { Tooltip } from "antd";
import { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { SurveillanceCameraInfo } from "../../types";
import { lifecycleBadge } from "../lifecycle";

import { IconPause, IconStart } from "@/assets/svg";
import Image from "@/components/image";

type SvCardProps = HTMLProps<HTMLDivElement> & {
    svCamInfo: SurveillanceCameraInfo;
    onPause: () => void;
    onResume: () => void;
};

const BADGE_TONE = {
    ok: "bg-[#dff6fd] text-[#00aeec]",
    warn: "bg-[#fff3e0] text-[#e68600]",
    muted: "bg-[#f1f2f3] text-[#61666d]",
    danger: "bg-[#fff0f0] text-[#e7000b]",
};

export default function SvCard({
    svCamInfo,
    onPause,
    onResume,
    className,
    ...rest
}: SvCardProps) {
    const badge = lifecycleBadge(
        svCamInfo.channelState,
        svCamInfo.lifecycleStatus,
    );
    const pausing = svCamInfo.lifecycleStatus === "pausing";
    const canPause = svCamInfo.channelState === "running" && !pausing;
    const canResume = svCamInfo.channelState === "paused" && !pausing;
    const channelNo =
        svCamInfo.device_id && svCamInfo.channel_id
            ? `${svCamInfo.device_id}-${svCamInfo.channel_id}`
            : svCamInfo.channel_id || svCamInfo.device_id || "--";
    const showName =
        Boolean(svCamInfo.name) &&
        svCamInfo.name !== channelNo &&
        svCamInfo.name !== svCamInfo.channel_id;

    return (
        <div className={twMerge("mt-6 select-none", className)} {...rest}>
            <Image
                className="relative rounded-md overflow-hidden cursor-pointer"
                src={`api/video/image?image_path=${svCamInfo.snapshotSrc}`}
                onClick={() => {}}
            >
                <Tooltip title={badge.title}>
                    <span
                        className={twMerge(
                            "absolute left-2 top-2 z-10 px-2 py-0.5 rounded text-xs",
                            BADGE_TONE[badge.tone],
                        )}
                    >
                        {badge.text}
                    </span>
                </Tooltip>
            </Image>
            <div className="mt-2.5">
                {showName && (
                    <div className="text-[15px] font-medium truncate">
                        {svCamInfo.name}
                    </div>
                )}
                <Tooltip title={`通道号 ${channelNo}`}>
                    <div
                        className={twMerge(
                            "text-[11px] text-[#9499a0] leading-4 whitespace-nowrap overflow-hidden text-ellipsis",
                            showName ? "mt-1" : "",
                        )}
                    >
                        通道号 {channelNo}
                    </div>
                </Tooltip>
                <div className="mt-2 h-7 box-border w-full flex items-center gap-2 min-w-0">
                    <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                        <div className="mr-1 h-7 px-2 bg-[#dff6fd] text-[12px] rounded-md flex justify-center items-center text-[#00aeec] shrink-0">
                            已应用算法
                        </div>
                        <Tooltip title={svCamInfo.appliedStrategies.join(" ")}>
                            <div className="text-[12px] text-[#9499a0] truncate">
                                {svCamInfo.appliedStrategies.length > 0
                                    ? svCamInfo.appliedStrategies.join(" ")
                                    : "暂无算法"}
                            </div>
                        </Tooltip>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            disabled={!canPause}
                            onClick={() => {
                                if (canPause) onPause();
                            }}
                            className={twMerge(
                                "h-7 px-2 rounded text-[12px] flex items-center gap-1 transition-colors",
                                canPause
                                    ? "bg-[#fff3e0] text-[#e68600] hover:opacity-90 cursor-pointer"
                                    : "bg-[#f1f2f3] text-[#c9ccd0] cursor-not-allowed",
                            )}
                        >
                            <IconPause className="h-3 w-3" />
                            暂停
                        </button>
                        <button
                            type="button"
                            disabled={!canResume}
                            onClick={() => {
                                if (canResume) onResume();
                            }}
                            className={twMerge(
                                "h-7 px-2 rounded text-[12px] flex items-center gap-1 transition-colors",
                                canResume
                                    ? "bg-[#dff6fd] text-[#00aeec] hover:opacity-90 cursor-pointer"
                                    : "bg-[#f1f2f3] text-[#c9ccd0] cursor-not-allowed",
                            )}
                        >
                            <IconStart className="h-3 w-3" />
                            恢复
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Tooltip } from "antd";
import { HTMLProps, useState } from "react";
import { twMerge } from "tailwind-merge";

import OneManage from "./oneManage";
import { SurveillanceCameraInfo, svStrategy } from "../../types";
import { lifecycleBadge } from "../lifecycle";

import { IconMenu } from "@/assets/svg";
import Dropdown from "@/components/dropdown";
import Image from "@/components/image";
import { deepCompare } from "@/hooks/useFetch";

type SvCardProps = HTMLProps<HTMLDivElement> & {
    svCamInfo: SurveillanceCameraInfo;
    onUpdateStrategies: (sts: svStrategy[]) => void;
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
    onUpdateStrategies,
    onPause,
    onResume,
    className,
    ...rest
}: SvCardProps) {
    const [showPopup, setShowPopup] = useState(false);
    const badge = lifecycleBadge(
        svCamInfo.channelState,
        svCamInfo.lifecycleStatus,
    );
    const pausing = svCamInfo.lifecycleStatus === "pausing";
    const canPause = svCamInfo.channelState === "running" && !pausing;
    const canResume = svCamInfo.channelState === "paused" && !pausing;

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
            <div className="mt-2.5 min-h-16 ">
                <div className="flex items-center justify-between relative">
                    <div className="max-w-[70%] break-words text-[15px] font-medium line-clamp-2 cursor-pointer">
                        {svCamInfo.name}
                    </div>
                    <Dropdown
                        position="bottom-left"
                        className={twMerge(
                            "absolute top-0.5 right-0 text-lg hover:bg-hover-1 rounded-sm cursor-pointer",
                        )}
                    >
                        <div
                            className="text-icon-1"
                            data-dropdown-type="button"
                        >
                            <IconMenu />
                        </div>
                        <div
                            className={
                                "w-[142px] py-3 rounded-xl bg-dropdown-bg-1 border-solid border border-border-1 box-border shadow-[0_8px_40px_rgba(0,0,0,.1)]"
                            }
                            data-dropdown-type="menu"
                        >
                            <div
                                className="h-10 text-text-1 text-sm hover:bg-hover-1 transition-colors flex items-center justify-center"
                                onClick={() => {
                                    setShowPopup(true);
                                }}
                            >
                                算法调整
                            </div>
                            <div
                                className={twMerge(
                                    "h-10 text-sm transition-colors flex items-center justify-center",
                                    canPause
                                        ? "text-text-1 hover:bg-hover-1 cursor-pointer"
                                        : "text-[#c9ccd0] cursor-not-allowed",
                                )}
                                onClick={() => {
                                    if (canPause) onPause();
                                }}
                            >
                                暂停布控
                            </div>
                            <div
                                className={twMerge(
                                    "h-10 text-sm transition-colors flex items-center justify-center",
                                    canResume
                                        ? "text-text-1 hover:bg-hover-1 cursor-pointer"
                                        : "text-[#c9ccd0] cursor-not-allowed",
                                )}
                                onClick={() => {
                                    if (canResume) onResume();
                                }}
                            >
                                恢复布控
                            </div>
                        </div>
                    </Dropdown>
                    <OneManage
                        showPopup={showPopup}
                        onClose={() => {
                            setShowPopup(false);
                        }}
                        handleSave={(sts: svStrategy[]) => {
                            if (deepCompare(sts, svCamInfo.appliedStrategies)) {
                                console.log("是一样的");
                            }
                            onUpdateStrategies(sts);
                        }}
                        handleCancel={() => {
                            setShowPopup(false);
                        }}
                        title={svCamInfo.name}
                        strategies={svCamInfo.appliedStrategies}
                    ></OneManage>
                </div>
                <div className="mt-1 h-7 pr-[30px] box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer flex items-center ">
                    <div className="mr-1 w-22 h-full p-2 bg-[#dff6fd] text-sm rounded-md flex justify-center items-center text-[#00aeec] shrink-0 text-[13px]">
                        已应用算法
                    </div>
                    <Tooltip title={svCamInfo.appliedStrategies.join(" ")}>
                        <div className="text-[13px] text-[#9499a0] truncate">
                            {svCamInfo.appliedStrategies.length > 0
                                ? svCamInfo.appliedStrategies.join(" ")
                                : "暂无算法"}
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

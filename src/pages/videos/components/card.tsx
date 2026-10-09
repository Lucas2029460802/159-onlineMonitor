import { FC, HTMLProps, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { Button } from "./button";

import { api } from "@/api";
import { TaskStatus, TaskStatusString } from "@/api/type";
import { IconDelete, IconDownload, IconReset, IconStop } from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import Image from "@/components/image";
import { VideoCrop } from "@/pages/upload/components/video-crop";
import { date2string, time2string } from "@/util/time";

interface CardProps extends HTMLProps<HTMLDivElement> {
    vid: number;
    owner: number;
    url: string;
    filename: string;
    duration: number;
    updateTime: Date;
    status: TaskStatus;
    timeProcessed: number | undefined;
    algorithmProcessingDurationMs?: number;
    algorithmQueueDurationMs?: number;
    backendQueueDurationMs?: number;
    eventCount?: number;
    onRefresh?: () => void;
}

const milliseconds2string = (milliseconds: number | undefined) =>
    milliseconds === undefined
        ? "--"
        : `${(milliseconds / 1000).toFixed(2)} 秒`;

export const Card: FC<CardProps> = (props) => {
    const {
        className,
        vid,
        owner,
        url,
        filename,
        duration,
        updateTime,
        status,
        timeProcessed,
        algorithmProcessingDurationMs,
        algorithmQueueDurationMs,
        backendQueueDurationMs,
        eventCount,
        onRefresh,
        ...rest
    } = props;
    const Confirm = useContext(ConfirmContext);
    const [show, setShow] = useState(false);
    const [imageWidth, setImgWidth] = useState<number>(10);
    const [imageHeight, setImgHeight] = useState<number>(10);
    const { taskId } = useParams();
    const hasDetailedMetrics =
        algorithmProcessingDurationMs !== undefined &&
        algorithmProcessingDurationMs > 0;
    const waitingDurationMs = hasDetailedMetrics
        ? (algorithmQueueDurationMs ?? 0) + (backendQueueDurationMs ?? 0)
        : undefined;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href =
            "/api/video/download?video_id=" +
            vid.toString() +
            "&user_id=" +
            owner.toString();
        // 如果需要可以指定文件名，例如：
        // link.download = "video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className={twMerge(
                "mt-6 pb-6 select-none border-b border-solid border-gray-1 flex justify-between",
                TaskStatus.COMPLETED === status && "cursor-pointer",
                className,
            )}
            onClick={() => {
                if (TaskStatus.COMPLETED === status) {
                    const paths = location.pathname.split("/");
                    window.open(
                        `/${paths[1]}/${taskId}/player?id=${vid}`,
                        "_blank",
                    );
                }
            }}
            {...rest}
        >
            <div className="flex">
                <div className="w-[154px] h-[87px] mr-6">
                    <Image
                        className="relative overflow-hidden"
                        src={`/api/video/image?image_path=${url}`}
                        onLoad={(e) => {
                            const img = e.currentTarget;
                            setImgHeight(img.naturalHeight);
                            setImgWidth(img.naturalWidth);
                        }}
                    >
                        <div
                            className={twMerge(
                                "absolute left-0 bottom-0 z-[2] w-full h-[38px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] px-2 pt-4 pb-1.5",
                                "flex justify-end items-center",
                            )}
                        >
                            <div className="text-[13px] leading-[18px] text-white">
                                {time2string(duration)}
                            </div>
                        </div>
                    </Image>
                </div>
                <div>
                    <div className="text-text-4">{filename}</div>
                    <div className="text-sm pt-3 text-text-5">
                        上传时间：{date2string(updateTime)}
                    </div>
                    <div className="text-sm pt-3 text-text-5 flex items-center gap-4">
                        <div>状态：{TaskStatusString[status]}</div>
                    </div>
                    {status === TaskStatus.COMPLETED && (
                        <div className="text-xs pt-2 text-text-5 flex flex-wrap gap-x-4 gap-y-1">
                            <span>
                                等候时间：
                                {milliseconds2string(waitingDurationMs)}
                            </span>
                            <span>
                                计算时间：
                                {hasDetailedMetrics
                                    ? milliseconds2string(
                                          algorithmProcessingDurationMs,
                                      )
                                    : time2string(timeProcessed)}
                            </span>
                            <span>
                                总事件数量：
                                {hasDetailedMetrics ? (eventCount ?? 0) : "--"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div
                className={twMerge(
                    "flex items-center justify-center gap-3 transition-opacity",
                    "opacity-100 visible",
                )}
            >
                <Button
                    onClick={(e) => {
                        Confirm?.showConfirm(
                            "确定要删除吗？",
                            "该操作无法撤回",
                            async () => {
                                const res = await api.video.delete(vid);
                                if (onRefresh) onRefresh();
                                console.log(res);
                                Confirm.hideConfirm();
                            },
                            () => {
                                Confirm.hideConfirm();
                            },
                        );
                        e.stopPropagation();
                    }}
                >
                    <IconDelete />
                    <div>删除</div>
                </Button>
                {(status === TaskStatus.ERROR ||
                    status === TaskStatus.UNPROCESSED) && (
                    <Button
                        onClick={(e) => {
                            setShow(true);
                            e.stopPropagation();
                        }}
                    >
                        <IconReset />
                        <div>分析</div>
                    </Button>
                )}
                {status === TaskStatus.COMPLETED && (
                    <Button
                        onClick={(e) => {
                            Confirm?.showConfirm(
                                "确定要下载该视频吗？",
                                "确认后浏览器会自动开始下载",
                                () => {
                                    handleDownload();
                                    Confirm.hideConfirm();
                                },
                                () => {
                                    Confirm.hideConfirm();
                                },
                            );
                            e.stopPropagation();
                        }}
                    >
                        <IconDownload />
                        <div>下载</div>
                    </Button>
                )}
                {status === TaskStatus.PROCESSING && (
                    <Button
                        onClick={() => {
                            Confirm?.showConfirm(
                                "确定要终止分析该视频吗？",
                                "该操作无法撤回",
                                async () => {
                                    await api.process.stop(vid);
                                    if (onRefresh) onRefresh();
                                    Confirm.hideConfirm();
                                },
                                () => {
                                    Confirm.hideConfirm();
                                },
                            );
                        }}
                    >
                        <IconStop />
                        <div>终止</div>
                    </Button>
                )}
            </div>
            {show && (
                <VideoCrop
                    firstFrame={`/api/video/image?image_path=${url}`}
                    imgWidth={imageWidth}
                    imgHeight={imageHeight}
                    defaultValue={{
                        cropX: 0,
                        cropY: 0,
                        resolutionX: imageWidth,
                        resolutionY: imageHeight,
                    }}
                    onClose={() => {
                        setShow(false);
                    }}
                    onConfirm={(_, resolutionX, resolutionY, cropX, cropY) => {
                        api.process
                            .start(vid, cropX, cropY, resolutionX, resolutionY)
                            .then(() => {
                                if (onRefresh) onRefresh();
                                setShow(false);
                            });
                    }}
                />
            )}
        </div>
    );
};

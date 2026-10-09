import { FC, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { Card } from "./components/card";
import { CheckBoxes } from "./components/checkboxes";

import { api } from "@/api";
import {
    string2TaskStatus,
    TaskStatus,
    TaskStatusString,
    Video,
} from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { Pagination } from "@/components/pagination";
import { VideoPaginationSize } from "@/config";
import { navigatePage } from "@/util/pagination";

export type TASK_FILTER_ALL = 7;
export const taskFilterAll = 7;

export const Videos: FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const group = string2TaskStatus(queryParams.get("group"));
    const current = Number(queryParams.get("page") ?? "1");
    const navigate = useNavigate();
    const [selected, setSelected] = useState<
        TaskStatus | TASK_FILTER_ALL | null
    >();
    const { taskId } = useParams();

    const [thumbnails, setThumbnails] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [totalVideos, setTotalVideos] = useState<number>(0);
    const [totalCompleted, setTotalCompleted] = useState<number>(0);
    const [totalError, setTotalError] = useState<number>(0);
    const [totalProcessing, setTotalProcessing] = useState<number>(0);
    const [totalWaiting, setTotalWaiting] = useState<number>(0);
    const [totalTranslating, setTotalTranslating] = useState<number>(0);
    const [totalUnprocessed, setTotalUnprocessed] = useState<number>(0);
    const [totalTransFailed, setTotalTransFailed] = useState<number>(0);

    const [unHandledThumbnails, setUnHandledThumbnails] = useState<Video[]>([]);
    const [queuingThumbnails, setQueuingThumbnails] = useState<Video[]>([]);
    const [pause, setPause] = useState<boolean>(false);

    const load = async (): Promise<void> => {
        setLoading(true);
        if (group !== undefined && group !== null && group !== taskFilterAll) {
            const thumbnailsResponse = await api.video.ownByStatus(
                group,
                current - 1,
                Number(taskId),
            );
            const size = await api.video.ownByStatusSize(group, Number(taskId));
            setTotal(size.Data);
            setSelected(group);
            setThumbnails(thumbnailsResponse.Data ?? []);
        } else {
            const thumbnailsResponse = await api.video.own(
                current - 1,
                Number(taskId),
            );
            const size = await api.video.ownSize(Number(taskId));
            setTotal(size.Data);
            setSelected(taskFilterAll);
            setThumbnails(thumbnailsResponse.Data ?? []);
        }
        setLoading(false);
    };

    const loadTotal = () => {
        api.video
            .ownSize(Number(taskId))
            .then((res) => setTotalVideos(res.Data));

        api.video.ownByStatusSize_Aggregate(Number(taskId)).then((res) => {
            const d = res.Data;
            setTotalCompleted(d[TaskStatus.COMPLETED]);
            setTotalError(d[TaskStatus.ERROR]);
            setTotalProcessing(d[TaskStatus.PROCESSING]);
            setTotalWaiting(d[TaskStatus.WAITING]);
            setTotalTranslating(d[TaskStatus.TRANSCODING]); // 注意变量名和状态名的对应（TRANSCODING → Translating）
            setTotalUnprocessed(d[TaskStatus.UNPROCESSED]);
            setTotalTransFailed(d[TaskStatus.TRANSCODEFAILED]);
        });
    };

    const loadUnhandled = async () => {
        const resUnhandled = await api.video.listUnhandled(Number(taskId));
        const resError = await api.video.listError(Number(taskId));
        setUnHandledThumbnails([
            ...(resUnhandled.Data ?? []),
            ...(resError.Data ?? []),
        ]);
    };

    const loadQueuing = async () => {
        const resQueuing = await api.video.listQueuing(Number(taskId));
        setQueuingThumbnails(resQueuing.Data ?? []);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            load();
            loadUnhandled();
            loadQueuing();
            loadTotal();
        }, 60000);
        return () => {
            clearInterval(intervalId);
        };
    }, [location]);

    useEffect(() => {
        load();
        loadTotal();
        loadUnhandled();
        loadQueuing();
    }, [location]);

    useLayoutEffect(() => {
        document.title = "视频浓缩 - 视频管理";
    }, []);

    const navigateTo = (group: TaskStatus | TASK_FILTER_ALL) => {
        const paths = location.pathname.split("/");
        navigate({
            pathname: taskId
                ? "/" + paths[1] + "/" + taskId + "/videos"
                : "/videos",
            search: `?group=${group}`,
        });
    };

    return (
        <div className="flex-1 overflow-scroll">
            <div className="mx-auto my-4 bg-white w-[980px]">
                <div className="relative h-16 select-none">
                    <div className="pl-10 pt-[26px] pb-[14px] text-base font-semibold leading-5 text-blue-1 border-b border-solid border-gray-1">
                        视频管理
                    </div>
                    <div className="absolute right-28 bottom-3">
                        <button
                            className="px-3 w-full h-8 rounded-md text-sm bg-[#fb2c36] flex items-center justify-center text-white gap-2 hover:opacity-90 cursor-pointer"
                            onClick={() => {
                                setPause(true);
                                setShow(true);
                            }}
                        >
                            <div>批量暂停</div>
                        </button>
                    </div>
                    <div className="absolute right-5 bottom-3">
                        <button
                            className="px-3 w-full h-8 rounded-md text-sm bg-[#fb7299] flex items-center justify-center text-white gap-2 hover:opacity-90 cursor-pointer"
                            onClick={() => {
                                setPause(false);
                                setShow(true);
                            }}
                        >
                            <div>批量分析</div>
                        </button>
                    </div>
                </div>
                <div className="px-10 pb-5 pt-2">
                    <div className="flex items-center justify-start text-sm h-8 gap-8 text-gray-5 select-none mb-4">
                        <div
                            className={twMerge(
                                selected === taskFilterAll && "text-blue-1",
                                "cursor-pointer ",
                            )}
                            onClick={() => navigateTo(taskFilterAll)}
                        >
                            全部视频 {totalVideos}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.COMPLETED &&
                                    "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => navigateTo(TaskStatus.COMPLETED)}
                        >
                            {TaskStatusString[TaskStatus.COMPLETED]}{" "}
                            {totalCompleted}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.PROCESSING &&
                                    "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => navigateTo(TaskStatus.PROCESSING)}
                        >
                            {TaskStatusString[TaskStatus.PROCESSING]}{" "}
                            {totalProcessing}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.WAITING &&
                                    "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => navigateTo(TaskStatus.WAITING)}
                        >
                            {TaskStatusString[TaskStatus.WAITING]}{" "}
                            {totalWaiting}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.ERROR && "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => navigateTo(TaskStatus.ERROR)}
                        >
                            {TaskStatusString[TaskStatus.ERROR]} {totalError}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.UNPROCESSED &&
                                    "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => navigateTo(TaskStatus.UNPROCESSED)}
                        >
                            {TaskStatusString[TaskStatus.UNPROCESSED]}{" "}
                            {totalUnprocessed}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.TRANSCODING &&
                                    "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => navigateTo(TaskStatus.TRANSCODING)}
                        >
                            {TaskStatusString[TaskStatus.TRANSCODING]}{" "}
                            {totalTranslating}
                        </div>
                        <div
                            className={twMerge(
                                selected === TaskStatus.TRANSCODEFAILED &&
                                    "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() =>
                                navigateTo(TaskStatus.TRANSCODEFAILED)
                            }
                        >
                            {TaskStatusString[TaskStatus.TRANSCODEFAILED]}{" "}
                            {totalTransFailed}
                        </div>
                    </div>
                    <div>
                        {loading && (
                            <div className="flex items-center justify-center py-4 gap-3">
                                <IconLoading />
                                <div>加载中</div>
                            </div>
                        )}
                        {!loading &&
                            thumbnails.map((item) => (
                                <Card
                                    key={`video-${item.Id}`}
                                    vid={item.Id}
                                    owner={item.Owner}
                                    url={item.ViewPath}
                                    filename={item.Name}
                                    duration={item.Duration}
                                    updateTime={item.UploadTime}
                                    status={item.Status}
                                    timeProcessed={item.TimeProcessed}
                                    algorithmProcessingDurationMs={
                                        item.AlgorithmProcessingDurationMs
                                    }
                                    algorithmQueueDurationMs={
                                        item.AlgorithmQueueDurationMs
                                    }
                                    backendQueueDurationMs={
                                        item.BackendQueueDurationMs
                                    }
                                    eventCount={item.EventCount}
                                    onRefresh={() => {
                                        load();
                                        loadTotal();
                                        loadUnhandled();
                                        loadQueuing();
                                    }}
                                />
                            ))}
                        {!loading && thumbnails.length === 0 && (
                            <div className="flex items-center justify-center py-4">
                                暂无视频
                            </div>
                        )}
                    </div>
                    {!loading && thumbnails.length !== 0 && (
                        <div className="w-full flex items-center justify-center mt-4">
                            <Pagination
                                total={Math.ceil(total / VideoPaginationSize)}
                                defaultValue={current}
                                onChange={(e) => {
                                    navigatePage(location, navigate, e);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            {show && (
                <CheckBoxes
                    videos={pause ? queuingThumbnails : unHandledThumbnails}
                    setShow={setShow}
                    onRefresh={() => {
                        load();
                        loadTotal();
                        loadUnhandled();
                        loadQueuing();
                    }}
                    pause={pause}
                />
            )}
        </div>
    );
};

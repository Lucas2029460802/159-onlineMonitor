import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import BigPic from "./components/big-pic";

import { api } from "@/api";
import { Task } from "@/api/type";
import {
    IconAgent,
    IconBigpic,
    IconCloudCheck,
    IconFolders,
    IconLogo,
    IconRightArrowBig,
    IconUpload,
} from "@/assets/svg";
import { taskFilterAll } from "@/pages/videos";
import { $UI } from "@/store/ui";

const Header: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { taskId } = useParams();

    const [replace, setReplace] = useState<boolean>(false);
    const [isTasks, setIsTasks] = useState<boolean>(false);
    const [isResult, setIsResult] = useState<boolean>(false);
    const [showBigPic, setShowBigPic] = useState(false);
    const [task, setTask] = useState<Task | null>(null);

    useEffect(() => {
        setReplace(
            location.pathname !== "/" && !location.pathname.includes("upload"),
        );
        setIsTasks(
            location.pathname === "/" || location.pathname.includes("tasks"),
        );
        setIsResult(
            location.pathname === "/" || location.pathname.includes("result"),
        );

        if (taskId) {
            api.task.get(Number(taskId)).then((res) => {
                setTask(res.Data);
            });
        } else {
            setTask(null);
        }
    }, [location.pathname, taskId]);

    const navigateTo = (url: string) => {
        if (!taskId) {
            navigate(url.startsWith("/offline") ? url : `/offline${url}`);
            return;
        }

        const target = `/offline/${taskId}${url}`;
        if (replace) {
            navigate(target);
        } else {
            window.open(target, "_blank");
        }
    };

    const showTaskActions = !isTasks && taskId !== undefined;

    return (
        <div className="sticky top-0 z-[10000] flex h-16 items-center justify-between bg-white px-6 shadow-[0_2px_10px_0_rgba(0,0,0,.05)]">
            <div className="flex items-center justify-start gap-2">
                <div
                    className="flex cursor-pointer items-center justify-center gap-2 select-none hover:text-blue-1"
                    onClick={() => {
                        if (location.pathname.includes("upload")) {
                            window.open("/offline", "_blank");
                        } else {
                            navigate("/offline");
                        }
                    }}
                >
                    <IconLogo className="text-2xl" />
                    首页
                </div>
                {task !== null && taskId !== undefined && (
                    <IconRightArrowBig className="scale-y-75 text-lg font-bold text-gray-2" />
                )}
                {task !== null && taskId !== undefined && (
                    <div
                        className="cursor-pointer select-none hover:text-blue-1"
                        onClick={() => {
                            navigateTo("/result");
                        }}
                    >
                        {task.TaskName}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-4">
                {/* 小浦智能体 - 已隐藏 */}
                {/* {!isTasks && taskId !== undefined && (
                    <button
                        className="flex items-center flex-col justify-center min-w-[60px] cursor-pointer hover:text-blue-1 h-[37.5px]"
                        onClick={() => {
                            navigateTo(`/search`);
                        }}
                    >
                        <IconAgent className="scale-110 text-lg" />
                        <div className="text-[13px]">智能助手</div>
                    </button>
                )} */}
                {!isTasks && taskId !== undefined && (
                    <button
                        className="flex min-w-[60px] cursor-pointer flex-col items-center justify-center hover:text-blue-1"
                        onClick={() => {
                            navigateTo("/new-bigpic");
                        }}
                    >
                        <IconBigpic className="text-lg" />
                        <div className="text-[13px]">大图预览</div>
                    </button>
                )}
                {showTaskActions && (
                    <button
                        className="flex min-w-[60px] cursor-pointer flex-col items-center justify-center hover:text-blue-1"
                        onClick={() => {
                            navigateTo("/result");
                        }}
                    >
                        <IconCloudCheck className="text-lg" />
                        <div className="text-[13px]">视频预览</div>
                    </button>
                )}
                {showTaskActions && (
                    <button
                        className="flex min-w-[60px] cursor-pointer flex-col items-center justify-center hover:text-blue-1"
                        onClick={() => {
                            navigateTo(`/videos?group=${taskFilterAll}`);
                        }}
                    >
                        <IconFolders className="text-lg" />
                        <div className="text-[13px]">视频管理</div>
                    </button>
                )}

                {isTasks && (
                    <button
                        className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#fb7299] px-3 text-sm text-white hover:opacity-90"
                        onClick={() => {
                            $UI.update("set add task", (draft) => {
                                draft.showAddTask = true;
                            });
                        }}
                    >
                        <IconFolders className="text-lg" />
                        <div>新增任务</div>
                    </button>
                )}

                {showTaskActions && (
                    <button
                        className="flex h-[34px] w-[90px] cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-1 text-white hover:opacity-90"
                        onClick={() => {
                            window.open(`/offline/${taskId}/upload`, "_blank");
                        }}
                    >
                        <IconUpload className="text-lg" />
                        <div>上传</div>
                    </button>
                )}
            </div>

            {taskId && isResult && showBigPic && (
                <BigPic showBigPic={showBigPic} setShowBigPic={setShowBigPic} />
            )}
        </div>
    );
};

Header.displayName = "Header";
export default Header;

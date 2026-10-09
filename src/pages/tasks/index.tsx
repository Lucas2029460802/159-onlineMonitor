import { FC, useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AddTask } from "./components/add-task";
import { TaskCard } from "./components/card";

import { api } from "@/api";
import { Task, User, UserRoles } from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { RangeTimePicker } from "@/pages/bigpic/components/time-picker";
import NotExist from "@/pages/video-player/assets/not-exist.svg?react";
import { $UI } from "@/store/ui";
import { $User } from "@/store/user";

import { Select } from "antd";
import dayjs from "dayjs";

type TimeRange = [dayjs.Dayjs, dayjs.Dayjs] | [undefined, undefined];

export const Tasks: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const ownerIdParam = searchParams.get("owner_id");
    const startTimeParam = searchParams.get("start_time");
    const endTimeParam = searchParams.get("end_time");

    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        if (startTimeParam && endTimeParam) {
            return [dayjs(startTimeParam), dayjs(endTimeParam)];
        }
        return [undefined, undefined];
    });

    const showAddTask = $UI.use((state) => state.showAddTask);
    const setShowAddTask = (v: boolean) => {
        $UI.update("show add task", (draft) => {
            draft.showAddTask = v;
        });
    };

    const currentUserId = $User.use((state) => state.Id);
    const currentRole = $User.use((state) => state.Role);
    const isAdmin = currentRole === UserRoles.Admin;

    // 所有用户默认选中自己，管理员可通过下拉切换为"全部"
    const selectedOwnerId = ownerIdParam
        ? Number(ownerIdParam)
        : currentUserId;
    const showAllTasks = selectedOwnerId === -1;

    const load = async () => {
        setLoading(true);
        const usersResponse = await api.user.stationUsers();
        setUsers(usersResponse.Data);
        const startTime =
            timeRange[0] ? timeRange[0].format("YYYY-MM-DD") : undefined;
        const endTime =
            timeRange[1] ? timeRange[1].format("YYYY-MM-DD") : undefined;
        const taskResponse = await api.task.list(startTime, endTime);
        setTasks(taskResponse.Data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [timeRange]);

    // Sync time range to URL params
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);
        if (timeRange[0] && timeRange[1]) {
            newParams.set("start_time", timeRange[0].format("YYYY-MM-DD"));
            newParams.set("end_time", timeRange[1].format("YYYY-MM-DD"));
        } else {
            newParams.delete("start_time");
            newParams.delete("end_time");
        }
        setSearchParams(newParams, { replace: true });
    }, [timeRange]);

    useLayoutEffect(() => {
        document.title = "离线分析 - 任务列表";
    }, []);

    const filteredTasks = showAllTasks
        ? tasks
        : tasks.filter((task) => task.Owner === selectedOwnerId);

    const handleOwnerChange = (value: number) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === -1) {
            newParams.set("owner_id", "-1");
        } else {
            newParams.set("owner_id", String(value));
        }
        setSearchParams(newParams, { replace: true });
    };

    return (
        <div className="px-[60px] w-full pt-4">
            {loading && (
                <div className="h-full flex items-center justify-center">
                    <div className="flex items-center justify-center py-4 gap-6 text-2xl">
                        <IconLoading />
                        <div>任务加载中</div>
                    </div>
                </div>
            )}
            {/* 筛选栏 */}
            {!loading && users.length > 0 && (
                <div className="mb-4 flex items-center gap-4">
                    <span className="text-sm text-[#61666D] whitespace-nowrap">
                        按用户筛选
                    </span>
                    <Select<number>
                        value={selectedOwnerId}
                        onChange={handleOwnerChange}
                        className="min-w-[160px]"
                        style={{ height: "32px" }}
                        popupMatchSelectWidth={false}
                        options={[
                            ...(isAdmin
                                ? [{ value: -1, label: "全部" }]
                                : []),
                            ...users.map((user) => ({
                                value: user.Id,
                                label: user.Name,
                            })),
                        ]}
                    />
                    <RangeTimePicker setTimeRange={setTimeRange} value={timeRange} />
                </div>
            )}
            {!loading && filteredTasks.length === 0 && (
                <div className="h-full flex items-center justify-center">
                    <span className="w-20 h-20">
                        <NotExist />
                    </span>
                    <span className="ml-4 text-2xl text-[#cdcdcd]">
                        {"暂无任务"}
                    </span>
                </div>
            )}
            {!loading && filteredTasks.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-5">
                    {filteredTasks.map((item, index) => (
                        <TaskCard
                            key={`task-card-${index}`}
                            owner={
                                users?.filter((user) => user.Id === item.Owner)?.[0]
                            }
                            updateTime={item.CreateTime}
                            onRefresh={load}
                            onClick={() => {
                                window.open(`${item.Id}/new-bigpic`);
                            }}
                            taskId={item.Id}
                        >
                            {item.TaskName}
                        </TaskCard>
                    ))}
                </div>
            )}
            {showAddTask && (
                <AddTask
                    onCancel={() => {
                        setShowAddTask(false);
                        load();
                    }}
                />
            )}
        </div>
    );
};
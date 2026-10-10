import { FC, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Card } from "./components/card";
import { Filter } from "./components/filter";

import { api } from "@/api";
import { User, Video } from "@/api/type";
import { PageLoading } from "@/components/page-loading";
import { Pagination } from "@/components/pagination";
import { HomePaginationSize, SortField, SortOrder } from "@/config";
import NotExist from "@/pages/video-player/assets/not-exist.svg?react";
import { navigatePage } from "@/util/pagination";

export const Home: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const current = Number(queryParams.get("page") ?? "1");
    const sortField = Number(
        queryParams.get("sort_field") ?? SortField.Filename.toString(),
    );
    const sortOrder = Number(
        queryParams.get("sort_order") ?? SortOrder.Desc.toString(),
    );

    const [thumbnails, setThumbnails] = useState<Video[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const { taskId } = useParams();
    const [filter, setFilter] = useState<SortField>(sortField);
    const [order, setOrder] = useState<SortOrder>(sortOrder);

    const load = async (): Promise<void> => {
        setLoading(true);
        const usersResponse = await api.user.stationUsers();
        setUsers(usersResponse.Data);
        const size = await api.video.listNum(Number(taskId));
        setTotal(Math.ceil(size.Data / HomePaginationSize));

        const thumbnailsResponse = await api.video.list(
            current - 1,
            Number(taskId),
            sortField,
            sortOrder,
        );
        setThumbnails(thumbnailsResponse.Data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        setFilter(sortField);
        setOrder(sortOrder);
        load();
    }, [location]);

    useLayoutEffect(() => {
        document.title = "视频浓缩 - 视频";
    }, []);

    return (
        <div className="h-full w-full">
            {!loading && thumbnails.length === 0 && (
                <div className="h-full w-full flex items-center justify-center">
                    <span className="w-20 h-20">
                        <NotExist />
                    </span>
                    <span className="ml-4 text-2xl text-[#cdcdcd]">
                        {"暂无视频"}
                    </span>
                </div>
            )}
            {loading && (
                <PageLoading
                    title="视频加载中"
                    description="正在获取视频列表"
                />
            )}
            <div className="px-[60px]">
                {!loading && thumbnails.length > 0 && (
                    <Filter
                        className="mt-5 flex items-center justify-start"
                        filter={filter}
                        order={order}
                        currentPage={current}
                    />
                )}
                {!loading && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3.5">
                        {thumbnails.map((item, index) => (
                            <Card
                                key={`home-thumbnail-${index}`}
                                vid={item.Id}
                                url={item.ViewPath}
                                filename={item.Name}
                                duration={item.Duration}
                                updateTime={item.UploadTime}
                                startTime={item.StartTime}
                                owner={
                                    users?.filter(
                                        (user) => user.Id === item.Owner,
                                    )?.[0]
                                }
                                onRefresh={() => {
                                    load();
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            {!loading && (
                <div className="pt-8 w-full flex items-center justify-center">
                    <Pagination
                        total={total}
                        defaultValue={current}
                        onChange={(e) => {
                            navigatePage(location, navigate, e, filter, order);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

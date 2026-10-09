import { Select } from "antd";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { SearchTarget } from "../new-big-pic";

import { api } from "@/api";
import { SortField, SortOrder } from "@/config";
interface VideoItems {
    Id: number;
    Name: string;
}
interface VideoSelectorProps {
    newSearchNavi: (newTarget: Partial<SearchTarget>) => void;
}
export default function VideoSelector({ newSearchNavi }: VideoSelectorProps) {
    const handleVideoChange = (value: number) => {
        newSearchNavi({ videoId: value, curPage: 1 });
    };

    const p = useParams<{ taskId: string }>();
    const [searchParams] = useSearchParams();
    const currentVideoId = Number(searchParams.get("videoId") ?? -1);
    const [videos, setVideos] = useState<VideoItems[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await api.video.list(
                0,
                Number(p.taskId),
                SortField.Filename,
                SortOrder.Desc,
                -1,
            );
            setLoading(false);

            if (res.Data) {
                const withoutAll = res.Data.map((d) => ({
                    Id: d.Id,
                    Name: d.Name,
                }));
                setVideos([{ Id: -1, Name: "全部视频" }, ...withoutAll]);
            } else {
                setVideos([{ Id: -1, Name: "全部视频" }]);
            }
        };
        load();
    }, []);
    return (
        <div className="flex gap-4 mb-[10px]">
            <span className="text-[#61666D] text-sm whitespace-nowrap ml-2 leading-8">
                视频源:
            </span>
            <Select<number>
                showSearch
                placeholder="搜索并选择视频"
                optionFilterProp="children"
                onChange={handleVideoChange}
                className="min-w-[240px] max-w-[320px] relative top-0.5"
                style={{ height: "32px" }}
                loading={loading}
                value={loading ? undefined : currentVideoId}
                popupMatchSelectWidth={false}
                filterOption={(input, option) => {
                    return (
                        (option as { value: number; label: string })?.label ??
                        ""
                    )
                        .toLowerCase()
                        .includes(input.toLowerCase());
                }}
                options={videos.map((video) => ({
                    value: video.Id,
                    label: video.Name,
                }))}
            />
        </div>
    );
}

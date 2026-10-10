import { Select } from "antd";
import { useEffect, useState } from "react";

import { api } from "@/api";

interface VideoItems {
    Id: number;
    Name: string;
}

interface VideoSelectorProps {
    value: number;
    onChange: (videoId: number) => void;
}

export default function VideoSelector({ value, onChange }: VideoSelectorProps) {
    const [videos, setVideos] = useState<VideoItems[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.online.getAllSv();
                if (res.Data) {
                    const withoutAll = res.Data.map((d) => ({
                        Id: d.Id,
                        Name: d.name,
                    }));
                    setVideos([{ Id: -1, Name: "全部视频" }, ...withoutAll]);
                } else {
                    setVideos([{ Id: -1, Name: "全部视频" }]);
                }
            } catch {
                setVideos([{ Id: -1, Name: "全部视频" }]);
            } finally {
                setLoading(false);
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
                onChange={onChange}
                className="min-w-[240px] max-w-[320px] relative top-0.5"
                style={{ height: "32px" }}
                loading={loading}
                value={loading ? undefined : value}
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

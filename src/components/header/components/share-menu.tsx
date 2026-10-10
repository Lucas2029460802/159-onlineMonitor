import { FC, useEffect, useState } from "react";

import { api } from "@/api";
import { IconRightArrow } from "@/assets/svg";
import { PageLoading } from "@/components/page-loading";
import { date2string } from "@/util/time";

export const ShareMenu: FC = () => {
    const [shares, setShares] = useState<
        { name: string; url: string; datetime: Date }[]
    >([]);
    const [loading, setLoading] = useState<boolean>(false);

    const load = async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 简单延迟加载
        const res = await api.share.others();
        setShares(
            res.Data?.map((item) => ({
                name: item.From.Station,
                url: item.From.Id.toString(),
                datetime: item.ShareTime,
            })) ?? [],
        );
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div
            className={
                "w-[372px] py-3 rounded-xl bg-dropdown-bg-1 border-solid border border-border-1 box-border shadow-[0_8px_40px_rgba(0,0,0,.1)] max-h-[540px] overflow-scroll"
            }
        >
            <div className="px-5 pt-5 pb-2.5 flex items-center justify-between">
                <div className="text-text-8 text-base font-semibold select-none">
                    来自分享
                </div>
                <div
                    className="text-text-8 text-xs select-none cursor-pointer flex items-center justify-center"
                    onClick={() => {
                        const paths = location.pathname.split("/");
                        window.open(`/${paths[1]}/share`, "_blank");
                    }}
                >
                    查看更多 <IconRightArrow className="text-base" />
                </div>
            </div>
            {shares.length === 0 && (
                <div className="px-3 py-5 flex items-center justify-center select-none">
                    {loading ? (
                        <PageLoading
                            title="加载中"
                            description="正在获取分享"
                            className="h-auto py-2"
                        />
                    ) : (
                        <div>暂无分享</div>
                    )}
                </div>
            )}
            {shares.length > 0 &&
                shares.map((item, index) => (
                    <div
                        key={`share-menu-${index}`}
                        className="px-5 py-4 hover:bg-border-1 select-none cursor-pointer"
                        onClick={() => {
                            const paths = location.pathname.split("/");
                            window.open(`/${paths[1]}/s/${item.url}`, "_blank");
                        }}
                    >
                        <div className="flex items-center justify-start gap-2">
                            <div>用户</div>
                            <div>{item.name}</div>
                            <div>向您分享了视频</div>
                        </div>
                        <div className="text-xs text-text-2">
                            {date2string(item.datetime)}
                        </div>
                    </div>
                ))}
        </div>
    );
};

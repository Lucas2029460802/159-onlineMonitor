import { useState } from "react";

import SearchCard from ".";
import { SearchPopup } from "./searchPopup";
import IconEmpty from "../../svg/icon-empty.svg?react";

import { SearchDataRes, SearchOne } from "@/api/type";
import { IconLoading } from "@/assets/svg";

interface SearchGridProps {
    loading: boolean;
    data: SearchDataRes | null;
    refresh: () => void;
}
export function SearchGrid({ loading, data, refresh }: SearchGridProps) {
    const [curImageInfo, setCurImageInfo] = useState<SearchOne | null>(null);
    const [show, setShow] = useState(false);
    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center ">
                <div className="flex items-center gap-6 text-2xl relative -top-15">
                    <IconLoading />
                    <div>实时监测信息加载中</div>
                </div>
            </div>
        );
    }

    if (!data || !data.Data || !data.Data.list || data.Data.list.length === 0)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="flex items-center gap-6 text-2xl relative -top-15 flex-col">
                    <IconEmpty />
                    <div className="text-[#9c9898]">暂无数据</div>
                </div>
            </div>
        );

    return (
        <div className="grid grid-cols-4 2xl:grid-cols-5 gap-5">
            {data.Data.list.map((item) => (
                <SearchCard
                    key={item.id}
                    time={item.time}
                    location={item.location}
                    url={item.url}
                    hitString={item.hitString}
                    onClick={() => {
                        setShow(true);
                        setCurImageInfo(item);
                        return undefined;
                    }}
                />
            ))}
            {curImageInfo !== null ? (
                <SearchPopup
                    show={show}
                    onClose={() => {
                        setShow(false);
                    }}
                    curImgInfo={curImageInfo}
                />
            ) : null}
        </div>
    );
}

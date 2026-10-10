import { useMemo, useState } from "react";

import SearchCard from ".";
import { SearchPopup } from "./searchPopup";
import IconEmpty from "../../svg/icon-empty.svg?react";
import { adaptSearchListToCards } from "../../util/media";

import { SearchCardItem, SearchDataRes, SearchMediaGenre } from "@/api/type";
import { PageLoading } from "@/components/page-loading";

interface SearchGridProps {
    loading: boolean;
    data: SearchDataRes | null;
    genre: SearchMediaGenre;
    refresh: () => void;
}
export function SearchGrid({ loading, data, genre, refresh }: SearchGridProps) {
    void refresh;
    const [curCard, setCurCard] = useState<SearchCardItem | null>(null);
    const [show, setShow] = useState(false);

    const cards = useMemo(() => {
        if (!data?.Data?.list) return [];
        return adaptSearchListToCards(data.Data.list, genre);
    }, [data, genre]);

    if (loading) {
        return (
            <PageLoading
                title="实时监测信息加载中"
                description="正在获取监测结果"
                className="h-auto min-h-[320px] py-12"
            />
        );
    }

    if (!data || !data.Data || cards.length === 0)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="flex items-center gap-6 text-2xl relative -top-15 flex-col">
                    <IconEmpty />
                    <div className="text-[#9c9898]">暂无数据</div>
                </div>
            </div>
        );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((item) => (
                <SearchCard
                    key={item.key}
                    time={item.event.time}
                    location={item.event.location}
                    imagePath={item.imagePath}
                    hitString={item.event.hitString}
                    tag={item.event.tag}
                    onClick={() => {
                        setShow(true);
                        setCurCard(item);
                        return undefined;
                    }}
                />
            ))}
            {curCard !== null ? (
                <SearchPopup
                    show={show}
                    onClose={() => {
                        setShow(false);
                    }}
                    curImgInfo={curCard.event}
                    initialImagePath={curCard.imagePath}
                    genre={genre}
                />
            ) : null}
        </div>
    );
}

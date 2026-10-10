import { useMemo, useState } from "react";

import SearchCard from ".";
import { SearchPopup } from "./searchPopup";
import IconEmpty from "../../svg/icon-empty.svg?react";
import { adaptSearchListToCards } from "../../util/media";

import { SearchCardItem, SearchDataRes, SearchMediaGenre } from "@/api/type";
import LazyImage from "@/components/image";

interface SearchGridProps {
    loading: boolean;
    data: SearchDataRes | null;
    genre: SearchMediaGenre;
    showTime: boolean;
    sortOrder: number;
    sortFieldId: number;
    refresh: () => void;
}

function sortCards(
    cards: SearchCardItem[],
    sortOrder: number,
    sortFieldId: number,
): SearchCardItem[] {
    const sorted = [...cards];
    if (sortFieldId === 1) {
        // 相似度：有命中关键词的靠前，其余保持接口顺序
        sorted.sort((a, b) => {
            const as = a.event.hitString ? 1 : 0;
            const bs = b.event.hitString ? 1 : 0;
            return bs - as;
        });
        return sorted;
    }
    sorted.sort((a, b) => {
        const at = a.event.time.getTime();
        const bt = b.event.time.getTime();
        return sortOrder === 0 ? at - bt : bt - at;
    });
    return sorted;
}

export function SearchGrid({
    loading,
    data,
    genre,
    showTime,
    sortOrder,
    sortFieldId,
    refresh,
}: SearchGridProps) {
    void refresh;
    const [curCard, setCurCard] = useState<SearchCardItem | null>(null);
    const [show, setShow] = useState(false);

    const cards = useMemo(() => {
        if (!data?.Data?.list) return [];
        const adapted = adaptSearchListToCards(data.Data.list, genre);
        return sortCards(adapted, sortOrder, sortFieldId);
    }, [data, genre, sortOrder, sortFieldId]);

    if (loading && !data) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                    <LazyImage
                        key={`skeleton-${index}`}
                        src=""
                        className="aspect-video bg-[#d1d5dc] flex items-center justify-center rounded-md overflow-hidden"
                    />
                ))}
            </div>
        );
    }

    if (!data || !data.Data || cards.length === 0) {
        return (
            <div className="h-[30vh] flex justify-center items-center mt-30">
                <div className="w-40 h-40">
                    <IconEmpty />
                    <div className="text-gray-400 text-xl mt-4 text-center">
                        事件数量为空！
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {loading && (
                <div className="pointer-events-none absolute right-0 -top-6 z-10 text-[11px] text-[#9499a0]">
                    更新中…
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cards.map((item) => (
                    <SearchCard
                        key={item.key}
                        time={item.event.time}
                        location={item.event.location}
                        imagePath={item.imagePath}
                        hitString={item.event.hitString}
                        genre={genre}
                        showTime={showTime}
                        onClick={() => {
                            setShow(true);
                            setCurCard(item);
                        }}
                    />
                ))}
            </div>
            {curCard !== null ? (
                <SearchPopup
                    show={show}
                    onClose={() => setShow(false)}
                    curImgInfo={curCard.event}
                    initialImagePath={curCard.imagePath}
                    genre={genre}
                />
            ) : null}
        </div>
    );
}

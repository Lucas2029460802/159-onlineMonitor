import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import BigPicGrid from "./components/grid";
import BigPicSideBar from "./components/sidebar";
export type urlCurEvtType =
    | "person"
    | "all"
    | "car"
    | "bike"
    | "other"
    | "face";
export type urlPicGenre = "png" | "gif" | "face";

export default function BigPicPage() {
    const [showTime, setShowTime] = useState(true);
    const location = useLocation();
    const [curPage, setCurPage] = useState<number>(
        Number(new URLSearchParams(location.search).get("page") ?? 1),
    );
    const [curEvtType, setCurEvtType] = useState<urlCurEvtType>(
        (new URLSearchParams(location.search).get("type") as urlCurEvtType) ??
            "all",
    );
    const [curPicGenre, setCurPicGenre] = useState<urlPicGenre>(
        (new URLSearchParams(location.search).get("genre") as urlPicGenre) ??
            "png",
    );
    const [sortOrder, setSortOrder] = useState(
        Number(new URLSearchParams(location.search).get("order") ?? 0),
    );

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setCurPage(Number(searchParams.get("page") ?? 1));
        setCurPicGenre((searchParams.get("genre") as urlPicGenre) ?? "png"); // 对应是GIF还是PNG
        setCurEvtType((searchParams.get("type") as urlCurEvtType) ?? "all"); // 对应图像分类
        setSortOrder(Number(searchParams.get("order") ?? 0));
    }, [location]);
    // 从URL中获取page 和 type gif all car person other
    return (
        <div className="flex w-full">
            <BigPicSideBar
                setShowTime={setShowTime}
                showTime={showTime}
                loading={false}
                curEvtType={curEvtType}
                sortOrder={sortOrder}
                genre={curPicGenre}
            ></BigPicSideBar>
            <BigPicGrid
                showTime={showTime}
                curPage={curPage}
                curEvtType={curEvtType}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                genre={curPicGenre}
            ></BigPicGrid>
        </div>
    );
}

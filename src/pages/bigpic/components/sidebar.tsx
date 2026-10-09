import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { urlCurEvtType, urlPicGenre } from "..";
import { IconGIF, IconPNG, IconTime } from "../assets/iconexport";

interface BigPicSideBarProps {
    showTime: boolean;
    setShowTime: React.Dispatch<React.SetStateAction<boolean>>;
    loading: boolean;
    curEvtType: urlCurEvtType;
    sortOrder: number;
    genre: urlPicGenre;
}
export default function BigPicSideBar({
    showTime,
    setShowTime,
    loading,
    curEvtType,
    sortOrder,
    genre,
}: BigPicSideBarProps) {
    const navigate = useNavigate();
    const lastPNGType = useRef(curEvtType);
    return (
        <div className="w-32 shadow-[2px_0_10px_rgba(0,0,0,0.05)] ">
            <ul className="text-sm select-none pt-4">
                <li
                    className="h-12 leading-12 hover:bg-[#f3f4f6] rounded px-2  cursor-pointer"
                    onClick={(e) => {
                        // if (loading) return;
                        e.stopPropagation();
                        lastPNGType.current = curEvtType;
                        const nextGenre = genre === "gif" ? "png" : "gif";
                        navigate(
                            `${location.pathname}?page=1&genre=${nextGenre}&type=${lastPNGType.current}&order=${sortOrder}`,
                        );
                    }}
                >
                    <span className="w-full h-full ">
                        {genre === "gif" ? (
                            <>
                                <IconPNG className="inline" />
                                <span className="text-sm"> 切换静态图</span>
                            </>
                        ) : (
                            <>
                                <IconGIF className="inline" />
                                <span className="text-sm"> 切换动态图</span>
                            </>
                        )}
                    </span>
                </li>
                <li
                    className="h-12 leading-12 hover:bg-[#f3f4f6] rounded px-2 cursor-pointer"
                    onClick={(e) => {
                        if (loading) return;
                        e.stopPropagation();
                        setShowTime((prev) => !prev);
                    }}
                >
                    <span className="w-full h-full ">
                        <IconTime className="inline" />
                        <span className="text-sm">
                            {showTime ? " 时间隐藏" : " 时间显示"}
                        </span>
                    </span>
                </li>
                {/* <li className="h-10 leading-10 hover:bg-[#f3f4f6] rounded px-2 cursor-not-allowed">
                    ★ 未来功能
                </li>
                <li className="h-10 leading-10 hover:bg-[#f3f4f6] rounded px-2 cursor-not-allowed">
                    ★ 未来功能
                </li>
                <li className="h-10 leading-10 hover:bg-[#f3f4f6] rounded px-2 cursor-not-allowed">
                    ★ 未来功能
                </li> */}
            </ul>
        </div>
    );
}

import { useLocation, useNavigate } from "react-router-dom";

import {
    IconLogo,
    IconMegaphone,
    IconPeopleCount,
    IconRealtime,
    IconRightArrowBig,
    IconSetAlg,
    IconSurveillance,
} from "@/assets/svg";

export const OnlineHeader = () => {
    const navigate = useNavigate();
    const navigateOnline = (url: string) => {
        navigate("/online/" + url);
    };
    const routeMap = new Map<string, string>([
        ["alert-center", "预警中心"],
        ["alg-set", "算法布控"],
        ["search", "实时监测"],
        ["surveillance-manage", "监控管理"],
        ["people-count", "人流统计"],
    ]);
    const location = useLocation();
    const getSubPageName = () => {
        for (const item of routeMap) {
            if (location.pathname.includes(item[0])) {
                return item[1];
            }
        }
        return "子页";
    };

    return (
        <div
            id="online-header"
            className="h-16 bg-white flex justify-between items-center px-6 shadow-[0_2px_10px_0_rgba(0,0,0,.05)]"
        >
            {/* 左侧导航区 */}
            <div className="flex items-center gap-2">
                <div
                    className="flex items-center justify-center gap-2 hover:text-blue-1 select-none cursor-pointer"
                    onClick={() => navigateOnline("")}
                >
                    <IconLogo className="text-2xl" />
                    在线监测
                </div>
                <IconRightArrowBig className="text-lg font-bold scale-y-75 text-gray-2" />
                <div className="select-none ">{getSubPageName()}</div>
            </div>

            {/* 右侧功能区 */}
            <div className="flex items-center gap-4">
                <button
                    className="flex items-center flex-col justify-center min-w-[60px] cursor-pointer hover:text-blue-1 h-[37.5px]"
                    onClick={() => navigateOnline(`surveillance-manage`)}
                >
                    <IconSurveillance className="text-lg scale-110" />
                    <div className="text-[13px]">监控总览</div>
                </button>
                <button
                    className="flex items-center flex-col justify-center min-w-[60px] cursor-pointer hover:text-blue-1 h-[37.5px] "
                    onClick={() => navigateOnline(`alg-set`)}
                >
                    <IconSetAlg className="text-lg scale-120 " />
                    <div className="text-[13px]">算法布控</div>
                </button>
                <button
                    className="flex items-center flex-col justify-center min-w-[60px] cursor-pointer hover:text-blue-1 h-[37.5px]"
                    onClick={() => navigateOnline(`alert-center`)}
                >
                    <IconMegaphone className="text-lg scale-110" />
                    <div className="text-[13px]">预警中心</div>
                </button>
                <button
                    className="flex items-center flex-col justify-center min-w-[60px] cursor-pointer hover:text-blue-1 h-[37.5px]"
                    onClick={() => navigateOnline(`search`)}
                >
                    <IconRealtime className="text-lg scale-110" />
                    <div className="text-[13px]">实时监测</div>
                </button>

                <button
                    className="flex items-center flex-col justify-center min-w-[60px] cursor-pointer hover:text-blue-1 h-[37.5px]"
                    onClick={() => navigateOnline(`people-count`)}
                >
                    <IconPeopleCount className="text-lg scale-130" />
                    <div className="text-[13px]">人流统计</div>
                </button>
            </div>
        </div>
    );
};

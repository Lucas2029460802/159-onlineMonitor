import { useLocation } from "react-router-dom";

import { IconLogo, IconRightArrowBig } from "@/assets/svg";

const routeMap = new Map<string, string>([
    ["alert-center", "预警中心"],
    ["alg-set", "算法布控"],
    ["search", "实时监测"],
    ["surveillance-manage", "监控总览"],
    ["people-count", "人流统计"],
]);

export const OnlineHeader = () => {
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
            className="h-14 bg-white flex items-center px-6 shadow-[0_2px_10px_0_rgba(0,0,0,.05)]"
        >
            <div className="flex items-center gap-2 text-text-4">
                <IconLogo className="text-xl text-blue-2" />
                <span className="text-sm text-text-2">在线监测</span>
                <IconRightArrowBig className="text-base scale-y-75 text-gray-2" />
                <span className="text-sm font-medium">{getSubPageName()}</span>
            </div>
        </div>
    );
};

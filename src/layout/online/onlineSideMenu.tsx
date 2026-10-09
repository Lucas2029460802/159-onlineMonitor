import { DownOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
    IconMegaphone,
    IconOnline,
    IconPeopleCount,
    IconRealtime,
    IconSetAlg,
    IconSurveillance,
} from "@/assets/svg";

const ONLINE_SUB_ROUTES = [
    {
        path: "surveillance-manage",
        label: "监控总览",
        Icon: IconSurveillance,
    },
    { path: "alg-set", label: "算法布控", Icon: IconSetAlg },
    { path: "alert-center", label: "预警中心", Icon: IconMegaphone },
    { path: "search", label: "实时监测", Icon: IconRealtime },
    { path: "people-count", label: "人流统计", Icon: IconPeopleCount },
] as const;

export const OnlineSideMenu = () => {
    const location = useLocation();
    const isOnlineRoute = location.pathname.startsWith("/online");
    const [expanded, setExpanded] = useState(isOnlineRoute);

    useEffect(() => {
        if (isOnlineRoute) {
            setExpanded(true);
        }
    }, [isOnlineRoute]);

    return (
        <li className="w-full">
            <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all select-none ${
                    isOnlineRoute
                        ? "bg-gradient-to-r from-[#6366f1] to-[#00aeec] text-white shadow-md"
                        : "hover:bg-white/10 text-white/90"
                }`}
            >
                <IconOnline className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium flex-1">在线监测</span>
                <DownOutlined
                    className={`text-xs opacity-70 transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                    }`}
                />
            </button>

            {expanded && (
                <ul className="mt-2 mx-1 p-2 rounded-xl bg-[#1a2226] flex flex-col gap-1.5">
                    {ONLINE_SUB_ROUTES.map(({ path, label, Icon }) => (
                        <li key={path}>
                            <NavLink
                                to={`/online/${path}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        isActive
                                            ? "bg-white/15 text-white"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0 opacity-80" />
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

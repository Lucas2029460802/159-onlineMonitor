import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";

import {
    IconLogout,
    IconOffline,
    IconSetting,
    IconUsers,
} from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import { Message } from "@/components/message";
import { OnlineSideMenu } from "@/layout/online/onlineSideMenu";
import { UserRoles } from "@/api/type";
import { $User } from "@/store/user";
import { $UI } from "@/store/ui";

interface SideBarItemProps {
    to: string;
    Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    text: string;
}

const SideBarItem = ({ to, Svg, text }: SideBarItemProps) => {
    return (
        <li className="w-full">
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive
                            ? "bg-white/15 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`
                }
            >
                <Svg className="w-5 h-5 shrink-0" />
                <span className="text-sm">{text}</span>
            </NavLink>
        </li>
    );
};

const LoggoutItem = () => {
    const Confirm = useContext(ConfirmContext);
    const handleLogout = () => {
        localStorage.setItem("token", "");
        $UI.update("log out", (draft) => {
            draft.login = false;
        });
        window.location.href = "/login";
    };
    return (
        <li className="w-full">
            <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => {
                    Confirm?.showConfirm(
                        "确定要注销登录吗？",
                        "需要重新登录",
                        async () => {
                            handleLogout();
                            Confirm.hideConfirm();
                        },
                        () => {
                            Confirm.hideConfirm();
                        },
                    );
                }}
            >
                <IconLogout className="w-5 h-5 shrink-0" />
                <span className="text-sm">登出</span>
            </button>
        </li>
    );
};

export const BaseLayout = () => {
    const role = $User.use((state) => state.Role);

    return (
        <div className="flex w-screen min-h-screen">
            <aside className="w-56 shrink-0 bg-[#222d32] text-white flex flex-col py-5 px-3">
                <div className="flex items-center gap-3 px-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-white shrink-0 overflow-hidden">
                        <img
                            src="/xiaopu.png"
                            alt=""
                            className="w-full h-full"
                        />
                    </div>
                    <span className="text-sm font-medium text-white/90">
                        慧眼系统
                    </span>
                </div>
                <div className="h-px bg-white/10 mx-2" />
                <ul className="w-full mt-4 flex flex-col gap-2 flex-1">
                    <SideBarItem
                        to="/offline"
                        Svg={IconOffline}
                        text="离线分析"
                    />
                    <OnlineSideMenu />
                    {role === UserRoles.Admin && (
                        <SideBarItem
                            to="/user-manage"
                            Svg={IconUsers}
                            text="用户管理"
                        />
                    )}
                    <SideBarItem
                        to="/server-status"
                        Svg={IconSetting}
                        text="数据中台"
                    />
                    <li className="flex-1" />
                    <LoggoutItem />
                </ul>
            </aside>
            <div className="flex-1 bg-[#dff2fe] min-w-0">
                <Outlet />
                <Message />
            </div>
        </div>
    );
};

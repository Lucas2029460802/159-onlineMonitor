import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";

import {
    // IconBaseAgent, // 已隐藏智能体
    // IconHome, // 已隐藏首页
    IconLogout,
    IconOffline,
    IconOnline,
    IconSetting,
    IconUsers,
} from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import { Message } from "@/components/message";
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
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col justify-center items-center py-1 rounded-xl hover:cursor-pointer hover:bg-white/20 ${
                    isActive ? "bg-white/15 " : ""
                }`
            }
        >
            <div className="w-7 h-7">
                <Svg className="w-full h-full" />
            </div>
            <div className="text-sm">{text}</div>
        </NavLink>
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
        <button
            className="flex flex-col justify-center items-center py-1 rounded-xl hover:cursor-pointer hover:bg-white/20 "
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
            <div className="w-7 h-7">
                <IconLogout className="w-full h-full" />
            </div>
            <div className="text-sm">登出</div>
        </button>
    );
};

export const BaseLayout = () => {
    // 只有分局(Admin)才显示用户管理入口
    const role = $User.use((state) => state.Role);

    return (
        <div className="flex w-screen min-h-screen">
            <div className="w-25 shrink-0 bg-[#222d32] text-white flex jusify-center items-center flex-col py-4 px-3">
                <div className="w-10 h-10 rounded-full bg-white">
                    <img src="/xiaopu.png" alt="" />
                </div>
                <div className="mt-2 h-0.25 bg-white/50 w-4/5"></div>
                <ul className="w-full mt-4 flex flex-col gap-4">
                    {/* 首页 - 已隐藏 */}
                    {/* <SideBarItem to="/index" Svg={IconHome} text="首页" /> */}
                    <SideBarItem
                        to="/offline"
                        Svg={IconOffline}
                        text="离线分析"
                    />
                    <SideBarItem
                        to="/online"
                        Svg={IconOnline}
                        text="在线监测"
                    />
                    {/* 智能体 - 已隐藏 */}
                    {/* <SideBarItem
                        to="/agent"
                        Svg={IconBaseAgent}
                        text="智能体"
                    /> */}
                    {/* 只有分局(Admin)才显示用户管理入口 */}
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
                    <LoggoutItem></LoggoutItem>
                </ul>
            </div>
            <div className="flex-1 bg-[#dff2fe] min-w-0">
                <Outlet />
                <Message />
            </div>
        </div>
    );
};

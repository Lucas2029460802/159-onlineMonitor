import { FC, useEffect, useLayoutEffect, useState } from "react";

import { AddUser } from "./components/add-user";
import { EditUser } from "./components/edit-user";
import { UserTable } from "./components/user-table";

import { api } from "@/api";
import { User, UserRoles } from "@/api/type";
import { IconLoading, IconUserAdd } from "@/assets/svg";
import { $User } from "@/store/user";

export const Users: FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<User[]>([]);
    const [showAddUser, setShowAddUser] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // 获取当前用户角色
    const role = $User.use((state) => state.Role);
    const currentUserId = $User.use((state) => state.Id);
    const isAdmin = role === UserRoles.Admin;

    const load = async () => {
        setLoading(true);
        const res = await api.user.list();
        // 派出所用户只显示自己的信息
        if (isAdmin) {
            setUsers(res.Data);
        } else {
            setUsers(res.Data.filter((u) => u.Id === currentUserId));
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    useLayoutEffect(() => {
        document.title = "视频浓缩 - 用户管理";
    }, []);

    return (
        <>
            <div className="flex-1 overflow-scroll">
                <div className="mx-auto my-4 bg-white w-[980px]">
                    <div className="h-16 select-none relative">
                        <div className="pl-10 pt-[26px] pb-[14px] text-base font-semibold leading-5 text-blue-1 border-b border-solid border-gray-1">
                            账户管理
                        </div>
                        {/* 只有分局才显示新增按钮 */}
                        {isAdmin && (
                            <div className="absolute right-3 bottom-[14px]">
                                <button
                                    className="w-[90px] h-[34px] rounded-lg bg-blue-1 flex items-center justify-center text-white gap-1.5 hover:opacity-90 cursor-pointer"
                                    onClick={() => {
                                        setShowAddUser(true);
                                    }}
                                >
                                    <IconUserAdd className="text-lg" />
                                    <div>新增</div>
                                </button>
                            </div>
                        )}
                    </div>
                    {!loading && (
                        <UserTable
                            users={users}
                            onDelete={() => {
                                load();
                            }}
                            // 派出所用户无删除权限
                            canDelete={isAdmin}
                            // 编辑回调
                            onEdit={(user) => {
                                setEditingUser(user);
                            }}
                        />
                    )}
                    <div className="px-10 pb-5 pt-2">
                        <div>
                            {loading && (
                                <div className="flex items-center justify-center py-4 gap-3">
                                    <IconLoading />
                                    <div>加载中</div>
                                </div>
                            )}
                            {!loading}
                        </div>
                    </div>
                </div>
            </div>
            {/* 新增用户弹窗 */}
            {showAddUser && (
                <AddUser
                    onCancel={() => {
                        setShowAddUser(false);
                        load();
                    }}
                />
            )}
            {/* 编辑用户弹窗 */}
            {editingUser && (
                <EditUser
                    user={editingUser}
                    onCancel={() => {
                        setEditingUser(null);
                        load();
                    }}
                />
            )}
        </>
    );
};

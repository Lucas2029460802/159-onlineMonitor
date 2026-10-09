import { FC, ReactNode, useContext, useEffect, useState } from "react";

import { api } from "@/api";
import { User } from "@/api/type";
import { ConfirmContext } from "@/components/confirm";
import { Table } from "@/components/table";
import { Message } from "@/util/ui";

const titles = ["名称", "用户名", "权限", "操作"];
const flexes = [2, 2, 1, 2];
const roles2string = ["管理员", "普通用户"];

interface UserTableProps {
    users: User[];
    onDelete?: () => void;
    canDelete?: boolean; // 是否有删除权限
    onEdit?: (user: User) => void; // 编辑回调
}

export const UserTable: FC<UserTableProps> = (props) => {
    const { users, onDelete, canDelete = true, onEdit } = props;

    const [rows, setRows] = useState<(string | ReactNode)[][]>([]);
    const Confirm = useContext(ConfirmContext);

    useEffect(() => {
        setRows(
            users.map((user, index) => [
                user.Station,
                user.Name,
                roles2string[user.Role],
                // 操作列：编辑和删除按钮
                <div
                    key={`user-${user.Id}-${index}`}
                    className="flex gap-3"
                >
                    {/* 编辑按钮 */}
                    {canDelete && (
                        <div
                            className="text-blue-1 cursor-pointer"
                            onClick={() => {
                                if (onEdit) onEdit(user);
                            }}
                        >
                            编辑
                        </div>
                    )}
                    {/* 删除按钮 */}
                    {canDelete && user.Id !== 1 ? (
                        <div
                            className="text-[#fb2c36] cursor-pointer"
                            onClick={() => {
                                Confirm?.showConfirm(
                                    `确定要删除用户 ${user.Station} 吗？`,
                                    "删除此用户会同时删除该用户创建的所有任务及相关视频文件，此操作无法撤回",
                                    () =>
                                        api.user.remove(user.Id).then(() => {
                                            Confirm.hideConfirm();
                                            Message.success(
                                                "delete user",
                                                "删除用户成功",
                                            );
                                            if (onDelete) onDelete();
                                        }),
                                    () => {
                                        Confirm.hideConfirm();
                                    },
                                );
                            }}
                        >
                            删除
                        </div>
                    ) : (
                        <div className="text-gray-400">-</div>
                    )}
                </div>,
            ]),
        );
    }, [users, canDelete]);

    return (
        <div className="px-5 pt-4">
            <Table titles={titles} flexes={flexes} rows={rows} />
        </div>
    );
};

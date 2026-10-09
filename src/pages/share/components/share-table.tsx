import { FC, ReactNode, useContext, useEffect, useState } from "react";

import { api } from "@/api";
import { User } from "@/api/type";
import { ConfirmContext } from "@/components/confirm";
import { Table } from "@/components/table";
import { date2string } from "@/util/time";
import { Message } from "@/util/ui";

const titles = ["名称", "用户名", "分享时间", "操作"];
const flexes = [2, 2, 2, 1];

interface ShareTableProps {
    users: (User & { shareId: number; shareTime: Date })[];
    onDelete?: () => void;
}

export const ShareTable: FC<ShareTableProps> = (props) => {
    const { users, onDelete } = props;

    const [rows, setRows] = useState<(string | ReactNode)[][]>([]);
    const Confirm = useContext(ConfirmContext);

    useEffect(() => {
        setRows(
            users.map((user, index) => [
                user.Station,
                user.Name,
                date2string(user.shareTime),
                <div
                    key={`share-${user.Id}-${index}`}
                    className="text-[#fb2c36] cursor-pointer"
                    onClick={() => {
                        Confirm?.showConfirm(
                            `确定要删除给用户 ${user.Station} 的分享吗？`,
                            "此操作无法撤回",
                            () =>
                                api.share.remove(user.shareId).then(() => {
                                    Confirm.hideConfirm();
                                    Message.success(
                                        "delete share",
                                        "删除分享成功",
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
                </div>,
            ]),
        );
    }, [users]);

    return <Table titles={titles} flexes={flexes} rows={rows} />;
};

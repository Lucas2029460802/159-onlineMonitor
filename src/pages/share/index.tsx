import { FC, useContext, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { ShareTable } from "./components/share-table";

import { api } from "@/api";
import { User } from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import { Search } from "@/components/search";
import { Message } from "@/util/ui";

export const Share: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<"my" | "others">("my");
    const [users, setUsers] = useState<User[]>([]);
    const [shareUsers, setShareUsers] = useState<
        (User & { shareId: number; shareTime: Date })[]
    >([]);
    const Confirm = useContext(ConfirmContext);
    const [myLength, setMyLength] = useState<number>(0);
    const [othersLength, setOtherLength] = useState<number>(0);

    useLayoutEffect(() => {
        document.title = "视频浓缩 - 分享";
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const group = queryParams.get("group");
        if (group !== "others") {
            setSelected("my");
        } else {
            setSelected("others");
        }
    }, [location]);

    const load = async () => {
        setLoading(true);
        setShareUsers([]);
        const queryParams = new URLSearchParams(location.search);
        const group = queryParams.get("group");
        const mySharesRes = await api.share.my();
        const otherShareRes = await api.share.others();
        setMyLength(mySharesRes.Data?.length ?? 0);
        setOtherLength(otherShareRes.Data?.length ?? 0);
        if (group !== "others") {
            if (mySharesRes.Data !== null) {
                setShareUsers(
                    mySharesRes.Data.map((share) => ({
                        shareId: share.Id,
                        shareTime: share.ShareTime,
                        ...share.To,
                    })),
                );
            }
        } else {
            if (otherShareRes.Data !== null) {
                setShareUsers(
                    otherShareRes.Data.map((share) => ({
                        shareId: share.Id,
                        shareTime: share.ShareTime,
                        ...share.From,
                    })),
                );
            }
        }
        const res = await api.user.list();
        setUsers(res.Data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [selected]);

    return (
        <div className="flex-1 overflow-scroll">
            <div className="mx-auto my-4 bg-white w-[980px]">
                <div className="h-16 select-none relative">
                    <div className="pl-10 pt-[26px] pb-[14px] text-base font-semibold leading-5 text-blue-1 border-b border-solid border-gray-1">
                        分享管理
                    </div>
                    <div className="w-[322px] absolute right-3 bottom-[14px]">
                        <Search
                            expandable
                            options={users.map((user) => ({
                                name: user.Station,
                                value: user.Id,
                            }))}
                            onClick={(option) => {
                                Confirm?.showConfirm(
                                    `确定要分享视频给用户 ${option.name} 吗？`,
                                    "此操作会分享所有视频",
                                    async () => {
                                        await api.share.add(
                                            option.value as number,
                                        );
                                        Confirm.hideConfirm();
                                        Message.success(
                                            "add share",
                                            "分享成功",
                                        );
                                        load();
                                    },
                                    () => {
                                        Confirm.hideConfirm();
                                    },
                                );
                            }}
                        />
                    </div>
                </div>
                <div className="px-10 pb-5 pt-2">
                    <div className="flex items-center justify-start text-sm h-8 gap-8 text-gray-5 select-none mb-4">
                        <div
                            className={twMerge(
                                selected === "my" && "text-blue-1",
                                "cursor-pointer ",
                            )}
                            onClick={() => {
                                const paths = location.pathname.split("/");
                                navigate({
                                    pathname: "/" + paths[1] + "/share",
                                    search: `?group=my`,
                                });
                            }}
                        >
                            我的分享 {myLength}
                        </div>
                        <div
                            className={twMerge(
                                selected === "others" && "text-blue-1",
                                "cursor-pointer hover:text-blue-1",
                            )}
                            onClick={() => {
                                const paths = location.pathname.split("/");
                                navigate({
                                    pathname: "/" + paths[1] + "/share",
                                    search: `?group=others`,
                                });
                            }}
                        >
                            分享给我 {othersLength}
                        </div>
                    </div>
                    <div>
                        {loading && (
                            <div className="flex items-center justify-center py-4 gap-3">
                                <IconLoading />
                                <div>加载中</div>
                            </div>
                        )}
                        {!loading && shareUsers.length > 0 && (
                            <ShareTable
                                users={shareUsers}
                                onDelete={() => {
                                    load();
                                }}
                            />
                        )}
                        {!loading && shareUsers.length === 0 && (
                            <div className="flex items-center justify-center py-4">
                                暂无分享
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

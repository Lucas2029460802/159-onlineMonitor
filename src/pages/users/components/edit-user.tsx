import { FC, useRef, useState } from "react";

import { api } from "@/api";
import { User, UserRoles } from "@/api/type";
import { IconLoading } from "@/assets/svg";
import { CheckBox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { Popup } from "@/components/popup";
import { Message } from "@/util/ui";

export interface EditUserProps {
    user: User; // 待编辑的用户信息
    onCancel: () => void;
}

// 编辑用户弹窗组件
export const EditUser: FC<EditUserProps> = (props) => {
    const { user, onCancel } = props;
    // 根据 role 初始化权限选择
    const [isAdmin, setIsAdmin] = useState<boolean>(user.Role === UserRoles.Admin);
    const [loading, setLoading] = useState<boolean>(false);
    const station = useRef<string>(user.Station);
    const name = useRef<string>(user.Name);
    const password = useRef<string>(""); // 密码可选，为空则不修改
    const passwordConfirm = useRef<string>("");

    return (
        <Popup show className="border-0">
            <div className="py-6 px-[38px] bg-white rounded-lg w-[554px]">
                <div className="text-base text-text-5 pb-[18px]">编辑用户</div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        名称
                    </div>
                    <Input
                        className="flex-1"
                        placeholder="请输入用户名称"
                        defaultValue={user.Station}
                        onInput={(e) => {
                            station.current = (
                                e.target as HTMLInputElement
                            ).value;
                        }}
                    />
                </div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        用户名
                    </div>
                    <Input
                        className="flex-1"
                        placeholder="请输入用户名"
                        defaultValue={user.Name}
                        onInput={(e) => {
                            name.current = (e.target as HTMLInputElement).value;
                        }}
                    />
                </div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        新密码
                    </div>
                    <Input
                        type="password"
                        className="flex-1"
                        placeholder="留空则不修改密码"
                        onInput={(e) => {
                            password.current = (
                                e.target as HTMLInputElement
                            ).value;
                        }}
                    />
                </div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        确认密码
                    </div>
                    <Input
                        type="password"
                        className="flex-1"
                        placeholder="留空则不修改密码"
                        onInput={(e) => {
                            passwordConfirm.current = (
                                e.target as HTMLInputElement
                            ).value;
                        }}
                    />
                </div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        权限
                    </div>
                    <div className="flex items-center gap-5">
                        <CheckBox
                            checked={isAdmin}
                            onClick={() => setIsAdmin(true)}
                        >
                            管理员
                        </CheckBox>
                        <CheckBox
                            checked={!isAdmin}
                            onClick={() => setIsAdmin(false)}
                        >
                            普通用户
                        </CheckBox>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-[10px]">
                    <button
                        className="rounded-sm bg-blue-1 w-[90px] h-7 text-xs text-white border border-solid border-blue-1 hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                        onClick={async () => {
                            if (loading) {
                                return;
                            }
                            if (station.current.length <= 0) {
                                Message.danger(
                                    "edit user err",
                                    "用户名称不能为空",
                                );
                                return;
                            }
                            if (name.current.length === 0) {
                                Message.danger(
                                    "edit user err",
                                    "用户名不能为空",
                                );
                                return;
                            }
                            // 密码验证：如果填写了密码，需要验证长度和一致性
                            if (password.current.length > 0) {
                                if (password.current.length > 0 && password.current.length < 6) {
                                    Message.danger(
                                        "edit user err",
                                        "密码不能少于 6 个字符",
                                    );
                                    return;
                                }
                                if (password.current !== passwordConfirm.current) {
                                    Message.danger(
                                        "edit user err",
                                        "密码与确认密码不一致",
                                    );
                                    return;
                                }
                            }
                            setLoading(true);
                            try {
                                await api.user.update(
                                    user.Id,
                                    name.current,
                                    password.current,
                                    station.current,
                                    isAdmin ? UserRoles.Admin : UserRoles.User,
                                );
                                setLoading(false);
                                onCancel();
                                Message.success(
                                    "edit user success",
                                    "更新用户成功",
                                );
                            } catch (error) {
                                console.log(error);
                                setLoading(false);
                            }
                        }}
                    >
                        {loading && <IconLoading className="text-xs" />}
                        确定
                    </button>
                    <button
                        className="rounded-sm bg-white w-[90px] h-7 text-xs text-[#222] border border-solid border-gray-1 cursor-pointer"
                        onClick={() => {
                            onCancel();
                        }}
                    >
                        取消
                    </button>
                </div>
            </div>
        </Popup>
    );
};

import { FC, useRef, useState } from "react";

import { api } from "@/api";
import { IconLoading } from "@/assets/svg";
import { CheckBox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { Popup } from "@/components/popup";
import { Message } from "@/util/ui";

export interface AddUserProps {
    onCancel: () => void;
}

export const AddUser: FC<AddUserProps> = (props) => {
    const { onCancel } = props;
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const station = useRef<string>("");
    const name = useRef<string>("");
    const password = useRef<string>("");
    const passwordConfirm = useRef<string>("");

    return (
        <Popup show className="border-0">
            <div className="py-6 px-[38px] bg-white rounded-lg w-[554px]">
                <div className="text-base text-text-5 pb-[18px]">新增用户</div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        名称
                    </div>
                    <Input
                        className="flex-1"
                        placeholder="请输入用户名称"
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
                        onInput={(e) => {
                            name.current = (e.target as HTMLInputElement).value;
                        }}
                    />
                </div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        密码
                    </div>
                    <Input
                        type="password"
                        className="flex-1"
                        placeholder="请输入密码"
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
                        placeholder="请输入密码"
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
                                    "add user err",
                                    "用户名称不能为空",
                                );
                                return;
                            }
                            if (name.current.length === 0) {
                                Message.danger(
                                    "add user err",
                                    "用户名不能为空",
                                );
                                return;
                            }
                            if (password.current.length === 0) {
                                Message.danger(
                                    "add user err",
                                    "密码不能为空",
                                );
                                return;
                            }
                            if (password.current !== passwordConfirm.current) {
                                Message.danger(
                                    "add user err",
                                    "密码与确认密码不一致",
                                );
                                return;
                            }
                            setLoading(true);
                            // await onConfirm();
                            try {
                                await api.user.add(
                                    name.current,
                                    password.current,
                                    station.current,
                                    isAdmin ? 0 : 1,
                                );
                                setLoading(false);
                                onCancel();
                                Message.success(
                                    "add user success",
                                    "添加用户成功",
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

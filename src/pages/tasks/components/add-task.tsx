import { FC, useRef, useState } from "react";

import { api } from "@/api";
import { IconLoading } from "@/assets/svg";
import { Input } from "@/components/input";
import { Popup } from "@/components/popup";
import { $User } from "@/store/user";
import { Message } from "@/util/ui";

export interface AddTaskProps {
    onCancel: () => void;
}

export const AddTask: FC<AddTaskProps> = (props) => {
    const { onCancel } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const taskName = useRef<string>("");

    return (
        <Popup show className="border-0">
            <div className="py-6 px-[38px] bg-white rounded-lg w-[554px]">
                <div className="text-base text-text-5 pb-[18px]">新增任务</div>
                <div className="flex items-center pb-6">
                    <div className="w-25 text-text-8 font-semibold text-sm">
                        名称
                    </div>
                    <Input
                        className="flex-1"
                        placeholder="请输入任务名称"
                        onInput={(e) => {
                            taskName.current = (
                                e.target as HTMLInputElement
                            ).value;
                        }}
                    />
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-[10px]">
                    <button
                        className="rounded-sm bg-blue-1 w-[90px] h-7 text-xs text-white border border-solid border-blue-1 hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                        onClick={async () => {
                            if (loading) {
                                return;
                            }
                            if (taskName.current.length <= 0) {
                                Message.danger(
                                    "add task err",
                                    "任务名称不能为空",
                                );
                                return;
                            }
                            setLoading(true);
                            try {
                                await api.task.add(
                                    taskName.current,
                                    $User.get().Id,
                                );
                                setLoading(false);
                                onCancel();
                                Message.success(
                                    "add task success",
                                    "添加任务成功",
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

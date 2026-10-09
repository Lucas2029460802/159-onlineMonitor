import { FC, HTMLProps, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

import { api } from "@/api";
import { User } from "@/api/type";
import { IconFolder, IconMenu } from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import Dropdown from "@/components/dropdown";
import { date2string } from "@/util/time";

interface TaskCardProps extends HTMLProps<HTMLDivElement> {
    onRefresh?: () => void;
    onClick?: () => void;
    owner?: User;
    updateTime: Date;
    taskId: number;
}

export const TaskCard: FC<TaskCardProps> = (props) => {
    const {
        children,
        onClick,
        className,
        onRefresh,
        updateTime,
        owner,
        taskId,
        ...rest
    } = props;
    const [showDropdownButton, setShowDropdownButton] =
        useState<boolean>(false);
    const Confirm = useContext(ConfirmContext);
    const handleMouseEnter = () => {
        setShowDropdownButton(true);
    };

    const handleMouseLeave = () => {
        setShowDropdownButton(false);
    };

    return (
        <div
            className={twMerge("mt-6 select-none cursor-pointer", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...rest}
        >
            <div className="w-full flex justify-center" onClick={onClick}>
                <IconFolder className="text-[110px]" />
            </div>
            <div className="mt-2.5 min-h-16 ">
                <div className="relative flex items-start justify-start">
                    <div
                        className="h-11 pr-[30px] box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer"
                        onClick={onClick}
                    >
                        {children}
                    </div>
                    <Dropdown
                        position="bottom-left"
                        className={twMerge(
                            "absolute top-0.5 right-0 text-lg hover:bg-hover-1 rounded-sm cursor-pointer",
                            showDropdownButton ? "visible" : "invisible",
                        )}
                        style={{
                            transition: showDropdownButton
                                ? ""
                                : "visibility 0s linear 150ms",
                        }}
                    >
                        <div
                            className="text-icon-1"
                            data-dropdown-type="button"
                        >
                            <IconMenu />
                        </div>
                        <div
                            className={
                                "w-[142px] py-3 rounded-xl bg-dropdown-bg-1 border-solid border border-border-1 box-border shadow-[0_8px_40px_rgba(0,0,0,.1)]"
                            }
                            data-dropdown-type="menu"
                        >
                            <div
                                className="h-10 text-red-400 text-sm hover:bg-hover-1 transition-colors flex items-center justify-center"
                                onClick={() => {
                                    Confirm?.showConfirm(
                                        "确定要删除吗？",
                                        "该操作无法撤回",
                                        async () => {
                                            await api.task.delete(taskId);
                                            if (onRefresh) onRefresh();
                                            Confirm.hideConfirm();
                                        },
                                        () => {
                                            Confirm.hideConfirm();
                                        },
                                    );
                                }}
                            >
                                删除
                            </div>
                        </div>
                    </Dropdown>
                </div>
                <div
                    className="h-[17px] mt-1 text-[13px] text-text-2 flex items-center cursor-pointer"
                    onClick={onClick}
                >
                    <div>来源: {owner?.Station}</div>
                    <div className="ml-1"> {date2string(updateTime)}</div>
                </div>
            </div>
        </div>
    );
};

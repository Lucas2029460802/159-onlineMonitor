import { FC, HTMLProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { SortField, SortOrder } from "@/config";
import { navigatePage } from "@/util/pagination";

interface FilterProps extends HTMLProps<HTMLDivElement> {
    filter: SortField;
    order: SortOrder;
    currentPage: number;
}

export const Filter: FC<FilterProps> = (props) => {
    const { filter, order, currentPage, ...rest } = props;
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <>
            <div {...rest}>
                <button
                    className={twMerge(
                        "px-[15px] mr-2.5 h-8 min-w-[100px] rounded-lg cursor-pointer text-sm",
                        filter === SortField.Filename &&
                            "text-blue-2 bg-blue-3",
                        filter !== SortField.Filename && "hover:text-blue-2",
                    )}
                    onClick={() => {
                        if (filter !== SortField.Filename)
                            navigatePage(
                                location,
                                navigate,
                                currentPage,
                                SortField.Filename,
                                order,
                            );
                    }}
                >
                    文件名排序
                </button>
                <button
                    className={twMerge(
                        "px-[15px] mr-2.5 h-8 min-w-[100px] rounded-lg cursor-pointer text-sm",
                        filter === SortField.Upload && "text-blue-2 bg-blue-3",
                        filter !== SortField.Upload && "hover:text-blue-2",
                    )}
                    onClick={() => {
                        if (filter !== SortField.Upload)
                            navigatePage(
                                location,
                                navigate,
                                currentPage,
                                SortField.Upload,
                                order,
                            );
                    }}
                >
                    上传时间
                </button>
                <button
                    className={twMerge(
                        "px-[15px] mr-2.5 h-8 min-w-[100px] rounded-lg cursor-pointer text-sm",
                        filter === SortField.OCR && "text-blue-2 bg-blue-3",
                        filter !== SortField.OCR && "hover:text-blue-2",
                    )}
                    onClick={() => {
                        if (filter !== SortField.OCR)
                            navigatePage(
                                location,
                                navigate,
                                currentPage,
                                SortField.OCR,
                                order,
                            );
                    }}
                >
                    OCR 时间排序
                </button>
            </div>
            <div {...rest}>
                <button
                    className={twMerge(
                        "px-[15px] mr-2.5 h-8 min-w-[100px] rounded-lg cursor-pointer text-sm",
                        order === SortOrder.Desc && "text-blue-2 bg-blue-3",
                        order !== SortOrder.Desc && "hover:text-blue-2",
                    )}
                    onClick={() => {
                        if (order !== SortOrder.Desc)
                            navigatePage(
                                location,
                                navigate,
                                currentPage,
                                filter,
                                SortOrder.Desc,
                            );
                    }}
                >
                    降序排序
                </button>
                <button
                    className={twMerge(
                        "px-[15px] mr-2.5 h-8 min-w-[100px] rounded-lg cursor-pointer text-sm",
                        order === SortOrder.Asc && "text-blue-2 bg-blue-3",
                        order !== SortOrder.Asc && "hover:text-blue-2",
                    )}
                    onClick={() => {
                        if (order !== SortOrder.Asc)
                            navigatePage(
                                location,
                                navigate,
                                currentPage,
                                filter,
                                SortOrder.Asc,
                            );
                    }}
                >
                    升序排序
                </button>
            </div>
        </>
    );
};

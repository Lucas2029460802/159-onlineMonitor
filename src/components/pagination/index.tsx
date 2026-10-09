import { FC, useEffect, useState } from "react";
import { UNSAFE_RouteModules } from "react-router-dom";

import { PaginationButton } from "./components/button";

interface PaginationProps {
    total: number;
    defaultValue?: number;
    onChange?: (current: number) => void;
    curPage?: number;
}

export const Pagination: FC<PaginationProps> = ({
    total,
    defaultValue = 1,
    onChange,
    curPage,
}: PaginationProps) => {
    const [current, setCurrent] = useState<number>(defaultValue);
    useEffect(() => {
        if (curPage !== undefined) {
            setCurrent(curPage);
        }
    }, [curPage]);
    const createButton = (arr: number[]) => {
        return arr.map((item) => (
            <PaginationButton
                key={`pagination-${item}`}
                selected={current === item}
                onClick={() => {
                    setCurrent(item);
                    if (onChange) onChange(item);
                }}
            >
                {item}
            </PaginationButton>
        ));
    };

    return (
        <div className="flex items-center gap-2">
            <PaginationButton
                className="w-[100px]"
                disabled={current === 1}
                onClick={() => {
                    if (onChange) onChange(current - 1);
                    setCurrent((prev) => (prev - 1 < 1 ? 1 : prev - 1));
                }}
            >
                上一页
            </PaginationButton>
            {total <= 8 &&
                createButton(Array.from({ length: total }, (_, i) => i + 1))}
            {total > 8 &&
                current <= 5 &&
                createButton(Array.from({ length: 7 }, (_, i) => i + 1))}
            {total > 8 && current <= 5 && <div className="w-[24px]">...</div>}
            {total > 8 && current <= 5 && createButton([total])}
            {total > 8 &&
                current > 5 &&
                current <= total - 4 &&
                createButton([1])}
            {total > 8 && current > 5 && current <= total - 4 && (
                <div className="w-[24px]">...</div>
            )}
            {total > 8 &&
                current > 5 &&
                current <= total - 4 &&
                createButton(
                    Array.from({ length: 5 }, (_, i) => current - 2 + i),
                )}
            {total > 8 && current > 5 && current <= total - 4 && (
                <div className="w-[24px]">...</div>
            )}
            {total > 8 &&
                current > 5 &&
                current <= total - 4 &&
                createButton([total])}
            {total > 8 && current > total - 4 && createButton([1])}
            {total > 8 && current > total - 4 && (
                <div className="w-[24px]">...</div>
            )}
            {total > 8 &&
                current > total - 4 &&
                createButton(
                    Array.from({ length: 7 }, (_, i) => total - 6 + i),
                )}
            <PaginationButton
                className="w-[100px]"
                disabled={current === total}
                onClick={() => {
                    if (onChange) onChange(current + 1);
                    setCurrent((prev) => (prev + 1 > total ? total : prev + 1));
                }}
            >
                下一页
            </PaginationButton>
        </div>
    );
};

import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TableProps {
    titles: string[];
    flexes?: number[];
    rows: (string | ReactNode)[][];
    needTransparent?: boolean;
    needRounded?: boolean;
}

export const Table: FC<TableProps> = (props) => {
    const {
        titles,
        flexes = [2, 2, 1, 2],
        rows,
        needTransparent = true,
        needRounded = true,
    } = props;

    return (
        <div className="w-full rounded-[14px]">
            <div
                className={twMerge(
                    "flex items-center justify-evenly bg-table-title  text-sm",
                    needRounded && "rounded-lg",
                )}
            >
                {titles.map((item, index) => (
                    <div
                        className={twMerge("pl-4 py-2.5 text-table-title-text")}
                        key={`table-title-${index}`}
                        style={{ flex: flexes[index] }}
                    >
                        {item}
                    </div>
                ))}
            </div>
            <div>
                {rows.map((row, rowIndex) => (
                    <div
                        key={`table-row-${rowIndex}`}
                        className={twMerge(
                            "flex text-table-row-text  text-sm",
                            rowIndex % 2 === 1 && "bg-table-title",
                            rowIndex % 2 === 0 &&
                                !needTransparent &&
                                "bg-white",
                            needRounded && "rounded-lg",
                        )}
                    >
                        {row.map((item, itemIndex) => (
                            <div
                                key={`table-row-${rowIndex}-item-${itemIndex}`}
                                style={{ flex: flexes[itemIndex] }}
                                className={twMerge("px-4 py-2")}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

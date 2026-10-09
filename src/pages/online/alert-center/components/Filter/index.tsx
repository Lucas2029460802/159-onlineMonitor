import { Select } from "antd";
import { twMerge } from "tailwind-merge";

import { ChangeFilter, FilterTarget } from "../..";
export type FilterOptions = {
    value: number | string;
    label: string;
}[];

export type ChannelRes = FilterOptions;
export interface FilterProps {
    typeName: string;
    options: FilterOptions | null;
    value: FilterTarget[keyof FilterTarget];
    onChange: ChangeFilter;
    field: keyof FilterTarget;
    selectClassName?: string;
    typeClassName?: string;
    loading?: boolean;
}

export default function Fitler(props: FilterProps) {
    return (
        <div className=" flex items-center justify-start gap-3">
            <div
                className={twMerge(
                    "text-center px-[13px] text-[14px] border-r-1 border-r-[#c9ccd0] text-[#61666d]",
                    props.typeClassName ?? "w-15",
                )}
            >
                {props.typeName}
            </div>
            <Select
                value={props.value}
                onChange={(value) => {
                    props.onChange(props.field, value);
                }}
                className={twMerge("", props.selectClassName ?? "w-50")}
                options={props.options ?? undefined}
                loading={props.loading ?? false}
            />
        </div>
    );
}

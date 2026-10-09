import { Tooltip } from "antd";
import React from "react";

interface InfoRowProps {
    label: string;
    value: string | number;
    popupContainer?: HTMLElement | null;
    width?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
    label,
    value,
    popupContainer,
    width,
}) => {
    return (
        <div className="flex text-sm justify-center">
            <span className={` font-medium text-[#364153] ${width ?? "w-28"}`}>
                {label}
            </span>
            <Tooltip
                title={value}
                getTooltipContainer={() => popupContainer ?? document.body}
            >
                <span className="text-[#101828] break-all">{value}</span>
            </Tooltip>
        </div>
    );
};

export default InfoRow;

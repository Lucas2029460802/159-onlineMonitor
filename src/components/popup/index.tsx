import { FC, HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { PopupCover } from "./components/popup-cover";

interface PopupProps extends HTMLProps<HTMLDivElement> {
    show?: boolean;
}

export const Popup: FC<PopupProps> = (props) => {
    const { show, className, ...rest } = props;
    return (
        <PopupCover
            className="flex items-center justify-center "
            style={!show ? { display: "none" } : undefined}
        >
            <div
                className={twMerge(
                    "shadow-[0_2px_4px_rgba(0,0,0,.16)]",
                    className,
                )}
                {...rest}
            ></div>
        </PopupCover>
    );
};

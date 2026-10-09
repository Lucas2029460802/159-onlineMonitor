import { FC, HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

export const PopupCover: FC<HTMLProps<HTMLDivElement>> = (props) => {
    const { className, children, ...rest } = props;
    return (
        <div
            className={twMerge(
                "overflow-hidden w-screen h-screen z-[99999] fixed top-0 left-0 bg-[rgba(0,0,0,.4)]",
                className,
            )}
            {...rest}
        >
            {children}
        </div>
    );
};

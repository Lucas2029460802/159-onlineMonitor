import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface PaginationButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    selected?: boolean;
    disabled?: boolean;
}

export const PaginationButton: FC<PaginationButtonProps> = (props) => {
    const {
        children,
        className,
        selected = false,
        disabled = false,
        onClick,
        ...rest
    } = props;
    return (
        <button
            className={twMerge(
                "border border-solid rounded-lg px-3 h-[34px] cursor-pointer select-none text-sm",
                "transition-colors",
                "border-border-1 bg-white text-text-8",
                selected && !disabled && "border-blue-2 bg-blue-2 text-white",
                !selected && !disabled && "hover:bg-border-1 ",
                disabled && "opacity-50 cursor-not-allowed",
                className,
            )}
            onClick={(e) => {
                if (disabled || onClick === undefined) return;
                onClick(e);
            }}
            {...rest}
        >
            {children}
        </button>
    );
};

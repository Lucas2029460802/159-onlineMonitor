import { FC, MouseEventHandler, ReactNode } from "react";

interface ButtonProps {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    children?: ReactNode;
}
export const Button: FC<ButtonProps> = (props) => {
    const { onClick, children } = props;
    return (
        <button
            className="h-[34px] w-[86px] border border-solid border-gray-1 text-text-5 text-xs hover:border-blue-1 hover:text-blue-1 flex items-center justify-center gap-1 cursor-pointer"
            onClick={onClick}
        >
            {children}
        </button>
    );
};

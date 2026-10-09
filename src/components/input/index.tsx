import { DetailedHTMLProps, FC, InputHTMLAttributes, useState } from "react";
import { twMerge } from "tailwind-merge";

export const Input: FC<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = (props) => {
    const { className, ...rest } = props;
    const [focused, setFocused] = useState<boolean>(false);

    return (
        <div
            className={twMerge(
                "h-9 border border-solid border-[#ccd0d7] px-3 hover:border-blue-1 transition-colors rounded-sm",
                "flex items-center",
                focused && "border-blue-1",
                className,
            )}
        >
            <input
                className="outline-0 text-sm text-[#222] leading-6 placeholder:text-[#C8CDD0] flex-1"
                onFocus={() => {
                    setFocused(true);
                }}
                onBlur={() => setFocused(false)}
                {...rest}
            />
        </div>
    );
};

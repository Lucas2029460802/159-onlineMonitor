/* eslint-disable react/prop-types */
import { twMerge } from "tailwind-merge";

import { SelectorChildProps } from "./selector";

export const SelectorOption: React.FC<SelectorChildProps> = ({
    className,
    ...restProps
}) => {
    return (
        <div className={twMerge("text-center", className)} {...restProps}>
            {restProps.labelTobeSelect}
        </div>
    );
};

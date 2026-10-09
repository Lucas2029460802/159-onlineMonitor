import {
    Children,
    FC,
    HTMLProps,
    isValidElement,
    ReactNode,
    useMemo,
    useState,
} from "react";
import { twMerge } from "tailwind-merge";

interface DropdownProps extends HTMLProps<HTMLDivElement> {
    position?:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "bottom-middle";
    trigger?: "click" | "hover";
    children: ReactNode;
}

const Dropdown: FC<DropdownProps> = (props) => {
    const {
        position = "bottom-right",
        children,
        trigger = "hover",
        className,
        ...rest
    } = props;
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    const dropdownButton = useMemo(() => {
        return Children.map(children, (child) => {
            if (isValidElement(child)) {
                const props = child.props as { "data-dropdown-type"?: string };
                if (props["data-dropdown-type"] === "button") {
                    return <div>{child}</div>;
                }
            }
        });
    }, [children]);

    const dropdownMenu = useMemo(() => {
        return Children.map(children, (child) => {
            if (isValidElement(child)) {
                const props = child.props as { "data-dropdown-type"?: string };
                if (props["data-dropdown-type"] === "menu") {
                    return (
                        <div
                            className={twMerge(
                                "absolute z-[9999]",
                                position === "top-left" &&
                                    "right-0 bottom-[120%]",
                                position === "top-right" &&
                                    "left-0 bottom-[120%]",
                                position === "bottom-left" &&
                                    "right-0 top-[120%]",
                                position === "bottom-right" &&
                                    "left-0 top-[120%]",
                                position === "bottom-middle" &&
                                    "left-[50%] top-[120%] -translate-x-1/2",
                                !isOpen && "invisible opacity-0",
                            )}
                            style={{
                                transition: isOpen
                                    ? "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                                    : "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 150ms",
                            }}
                        >
                            {child}
                        </div>
                    );
                }
            }
        });
    }, [children, position, isOpen]);

    return (
        <div
            onMouseEnter={trigger === "hover" ? handleMouseEnter : undefined}
            onMouseLeave={trigger === "hover" ? handleMouseLeave : undefined}
            onClick={trigger === "click" ? handleClick : undefined}
            className={twMerge("relative", className)}
            {...rest}
        >
            {dropdownButton}
            {dropdownMenu}
        </div>
    );
};

Dropdown.displayName = "Dropdown";

export default Dropdown;

import { FC, HTMLProps, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

interface SidebarItemProps extends HTMLProps<HTMLDivElement> {
    icon?: ReactNode;
    title?: string;
    url?: string;
    replace?: boolean;
}

export const SidebarItem: FC<SidebarItemProps> = (props) => {
    const { icon, className, title, url, replace = true, ...rest } = props;
    const navigate = useNavigate();
    const { taskId } = useParams();

    return (
        <div
            className={twMerge(
                "pl-8 pr-6 flex items-center h-12 text-gray-2 hover:bg-bg-1 select-none cursor-pointer",
                className,
            )}
            {...rest}
            onClick={() => {
                const paths = location.pathname.split("/");
                if (url) {
                    if (replace) {
                        navigate(
                            taskId ? "/" + paths[1] + "/" + taskId + url : url,
                        );
                    } else {
                        window.open(
                            taskId ? "/" + paths[1] + "/" + taskId + url : url,
                            "_blank",
                        );
                    }
                }
            }}
        >
            {icon}
            <div className="w-[90px] text-sm">{title}</div>
        </div>
    );
};

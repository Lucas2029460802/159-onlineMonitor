import { FC } from "react";

import { Icon404 } from "@/assets/svg";

export const NotFoundPage: FC = () => {
    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="flex items-center justify-center py-4 gap-6 text-2xl">
                <span className="w-20 h-20">
                    <Icon404 />
                </span>
                <div>页面不存在～</div>
            </div>
        </div>
    );
};

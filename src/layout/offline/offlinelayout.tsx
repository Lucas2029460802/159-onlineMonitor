import { Outlet } from "react-router-dom";

import Header from "@/components/header";
import { Message } from "@/components/message";

export const OfflineSystemLayout = () => {
    return (
        <div className="relative">
            <Message />
            <Header />
            <div className="flex h-[calc(100vh-64px)] w-full overflow-scroll bg-bg-1">
                <Outlet />
            </div>
            <div className="flex justify-end absolute bottom-0 w-full text-[7px]">
                v-1.1
            </div>
        </div>
    );
};

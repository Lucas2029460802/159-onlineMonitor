import { Outlet } from "react-router-dom";

import { OnlineHeader } from "./onlineheader";

import { Message } from "@/components/message";

export const OnlineSystemLayout = () => {
    return (
        <div>
            <Message />
            <OnlineHeader />
            <div className="h-[calc(100vh-56px)] bg-bg-1">
                <Outlet></Outlet>
            </div>
        </div>
    );
};

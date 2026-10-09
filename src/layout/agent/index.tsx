import { Outlet } from "react-router-dom";

export const AgentSystemLayout = () => {
    return (
        <div className="h-full">
            <Outlet></Outlet>
        </div>
    );
};

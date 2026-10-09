import { FC, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

import IconMessageDanger from "./assets/message-danger.svg?react";
import IconMessageSuccess from "./assets/message-success.svg?react";
import IconMessageWarning from "./assets/message-warning.svg?react";

import { $UI } from "@/store/ui";

export const Message: FC = () => {
    const visible = $UI.use((state) => state.messageDisplay);
    const type = $UI.use((state) => state.messageType);
    const content = $UI.use((state) => state.messageContent);
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (visible) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                $UI.update("close message", (draft) => {
                    draft.messageDisplay = false;
                });
            }, 5000);
        }
    }, [visible]);

    return (
        <div
            className={twMerge(
                "fixed top-[10%] left-[50%] -translate-x-1/2 max-w-[600px] z-[999999]",
                "flex flex-row py-3 px-4 gap-x-2 rounded-xl items-center box-border",
                type === "success" && "text-[#0E793C] bg-[#E8FAF0]",
                type === "warning" && "text-[#936316] bg-[#FEFCE8]",
                type === "danger" && "text-[#C20E4C] bg-[#FEE7EF]",
                !visible && "invisible opacity-0",
            )}
            style={{
                transition: visible
                    ? "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                    : "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 150ms",
            }}
        >
            {type === "success" && (
                <IconMessageSuccess className="text-xl min-w-5 min-h-5" />
            )}
            {type === "warning" && (
                <IconMessageWarning className="text-xl min-w-5 min-h-5" />
            )}
            {type === "danger" && (
                <IconMessageDanger className="text-xl min-w-5 min-h-5" />
            )}
            <div className="">{content}</div>
        </div>
    );
};

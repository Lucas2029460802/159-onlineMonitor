import { useState } from "react";

import { IconAgent, IconUnfoldSideBar } from "@/assets/svg";
interface UnfoldButtonProps {
    handleUnfold: () => void;
}
export default function UnfoldButton({ handleUnfold }: UnfoldButtonProps) {
    const [hoverOnAgent, setHoverOnAgent] = useState(false); // 新增：记录鼠标是否悬停agent图标

    return (
        <button
            className="w-6 h-6 flex items-center justify-center cursor-ew-resize font-semibold text-xl"
            onClick={handleUnfold}
            onMouseEnter={() => setHoverOnAgent(true)}
            onMouseLeave={() => setHoverOnAgent(false)}
        >
            {hoverOnAgent ? (
                <IconUnfoldSideBar className="text-[15px]" />
            ) : (
                <IconAgent />
            )}
        </button>
    );
}

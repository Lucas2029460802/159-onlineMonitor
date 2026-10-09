import { ReactNode } from "react";

import { CurButtonItem } from "./capture-action";

interface CaptureActionItemProps {
    children?: ReactNode;
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    title: string;
    curButton: CurButtonItem;
    setCurButton: React.Dispatch<React.SetStateAction<CurButtonItem>>;
    selfButton: CurButtonItem;
    onClickLogic: () => void;
}
export default function CaptureActionItem({
    children,
    icon: Icon,
    title,
    selfButton,
    curButton,
    setCurButton,
    onClickLogic,
}: CaptureActionItemProps) {
    return (
        <li
            className="w-9 h-9 p-1.5 relative box-border"
            title={title}
            onClick={() => {
                if (curButton === selfButton) {
                    setCurButton(CurButtonItem.None);
                } else {
                    setCurButton(selfButton);
                }
                onClickLogic();
            }}
        >
            <Icon></Icon>
            {selfButton === curButton && children}
        </li>
    );
}

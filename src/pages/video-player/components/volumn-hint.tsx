import { useEffect, useRef, useState } from "react";

import VolumnMuteIcon from "../assets/volumn-hint-mute.svg?react";
import VolumnIcon from "../assets/volumn-hint.svg?react";
import { close2Zero } from "../util";

interface VolumnHintProps {
    volumn: number;
    showHint: boolean;
    setShowHint: React.Dispatch<React.SetStateAction<boolean>>;
    randTriggerShowHint: number;
}
export default function VolumnHint({
    volumn,
    showHint,
    setShowHint,
    randTriggerShowHint,
}: VolumnHintProps) {
    const [opacity, setOpacity] = useState(0);
    const timer = useRef<undefined | number>(undefined);
    useEffect(() => {
        if (!showHint) return;
        clearTimeout(timer.current);
        setOpacity(1);
        timer.current = setTimeout(() => {
            setOpacity(0);
            setShowHint(false);
        }, 1000);
        return () => {
            clearTimeout(timer.current);
        };
    }, [randTriggerShowHint, setShowHint, showHint]);
    return (
        <div
            id="dml-volumn-hint"
            style={{
                transition: " 0.3s",
                opacity: opacity,
            }}
            className="absolute  bg-[hsla(0,0%,100%,.8)] flex  h-8 min-w-[84px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
             text-xl p-2 cursor-default
              rounded-sm box-content"
        >
            <span className="w-[34px] h-[34px] flex-none">
                {close2Zero(volumn) ? <VolumnMuteIcon /> : <VolumnIcon />}
            </span>
            <span className="px-0.5 text-xl leading-[34px] text-center flex-1">
                {close2Zero(volumn) ? "静音" : `${Math.round(volumn * 100)}%`}
            </span>
        </div>
    );
}

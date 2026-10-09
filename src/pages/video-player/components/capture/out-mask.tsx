import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import ReactDOM from "react-dom";
export interface OutMaskHandle {
    show: () => void;
    off: () => void;
}
interface OutMaskProps {
    ref: Ref<OutMaskHandle>;
}

export function OutMask({ ref }: OutMaskProps) {
    const maskDivRef = useRef<HTMLDivElement>(null);
    const [showMask, setShowMask] = useState(false);
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowMask(false);
        }
    };
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    useImperativeHandle(ref, () => {
        return {
            show() {
                setShowMask(true);
            },
            off() {
                setShowMask(false);
            },
        };
    }, []);
    return ReactDOM.createPortal(
        showMask && (
            <div
                ref={maskDivRef}
                className="fixed top-0 left-0 w-full h-full bg-black/90 z-[100]"
            ></div>
        ),
        document.body,
    );
}

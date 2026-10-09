import { useRef } from "react";

export const Index = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full h-full">
            <div className="w-full h-full" ref={mapContainerRef}>
                首页
            </div>
        </div>
    );
};

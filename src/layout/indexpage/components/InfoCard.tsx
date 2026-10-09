import React from "react";

import { IconAddress, IconTimer } from "@/assets/svg";

interface InfoCardProps {
    imgSrc: string;
    address: string;
    time: string;
    offset?: [number, number];
}

export const InfoCard: React.FC<InfoCardProps> = ({
    imgSrc,
    address,
    time,
    offset = [0, 0],
}) => (
    <div
        style={{
            width: "140px",
            background: "#fff0f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(255,0,0,0.3)",
            fontSize: "12px",
            overflow: "hidden",
            position: "relative",
            transform: `translate(${offset[0]}px, ${offset[1]}px)`,
        }}
    >
        <div
            style={{ position: "relative", width: "100%", overflow: "hidden" }}
        >
            <img src={imgSrc} style={{ width: "100%", height: "auto" }} />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    padding: "6px",
                    color: "#fff",
                    background:
                        "linear-gradient(to top, rgba(255,0,0,0.8), rgba(255,0,0,0))",
                    backdropFilter: "blur(4px)",
                }}
            >
                <div className="flex items-center">
                    <span className="inline-block h-5 w-5 flex-shrink-0">
                        <IconAddress className="h-full w-full" />
                    </span>
                    <span className="ml-1 text-[11px]">{address}</span>
                </div>
                <div className="flex items-center mt-1">
                    <span className="inline-block h-5 w-5 flex-shrink-0">
                        <IconTimer className="h-full w-full scale-90" />
                    </span>
                    <span className="ml-1 text-[11px]">{time}</span>
                </div>
            </div>
        </div>
    </div>
);

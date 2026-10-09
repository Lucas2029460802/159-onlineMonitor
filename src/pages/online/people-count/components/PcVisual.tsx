// src/pages/people-count/components/PcVisual.tsx
import PeopleCountCard from "./peopleCountCard";
import { SurveillanceCameraInfo } from "../../types";

interface PcVisualProps {
    svInfo: SurveillanceCameraInfo[];
    cardSvIds: (string | null)[];
    cardRow: number;
    onSelectChange: (selectedTreeIds: string[]) => void;
}

export default function PcVisual({
    svInfo,
    cardSvIds,
    cardRow,
    onSelectChange,
}: PcVisualProps) {
    return (
        <div
            className="grid gap-x-2 gap-y-6 px-2 py-4 overflow-x-scroll items-center"
            style={{
                justifyItems: "center", // 在grid内水平居中
                gridTemplateColumns: `repeat(${cardRow}, minmax(0, 1fr))`,
            }}
        >
            {cardSvIds.map((svId, index) => {
                const data = svInfo.find((item) => item.svId === svId) ?? null;
                return (
                    <PeopleCountCard
                        key={`${index}-${svId}`}
                        data={data}
                        handleClose={onSelectChange}
                    />
                );
            })}
        </div>
    );
}

import { EventType } from "..";

const ITEMS: { label: string; type: EventType }[] = [
    { label: "全部事件", type: "all" },
    { label: "行人", type: "person" },
    { label: "机动车", type: "car" },
    { label: "非机动车", type: "bike" },
    { label: "其它", type: "other" },
];

export default function CategoryGroup({
    evtType,
    onChange,
}: {
    evtType: EventType;
    onChange: (type: EventType) => void;
}) {
    return (
        <ul id="category-group" className="flex gap-[10px] mb-[10px] flex-wrap">
            {ITEMS.map(({ label, type }) => (
                <li
                    key={type}
                    onClick={() => onChange(type)}
                    className={`w-25 px-[15px] h-8 text-sm rounded-lg cursor-pointer select-none leading-8 transition-colors text-center flex justify-center items-center ${
                        evtType === type
                            ? "text-[#00AEEC] bg-[#DFF6FD]"
                            : "text-[#61666D] hover:text-[#00AEEC]"
                    }`}
                >
                    <span>{label}</span>
                </li>
            ))}
        </ul>
    );
}

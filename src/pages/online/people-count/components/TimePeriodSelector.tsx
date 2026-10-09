import { twMerge } from "tailwind-merge";

interface TimePeriodSelectorProps {
    value: "hour" | "week" | "month";
    onChange: (value: "hour" | "week" | "month") => void;
}

const options = [
    { key: "hour", label: "最近一小时" },
    { key: "week", label: "最近一周" },
    { key: "month", label: "最近一月" },
] as const;

const TimePeriodSelector = ({ value, onChange }: TimePeriodSelectorProps) => {
    return (
        <div className="flex items-center gap-6 mb-4">
            {options.map((item) => {
                const selected = value === item.key;
                return (
                    <div
                        key={item.key}
                        className="flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => onChange(item.key)}
                    >
                        <div
                            className="w-3 h-3 rounded-full border-3 transition-all duration-200"
                            style={{
                                borderColor: selected ? "#00aeec" : "#9dd4ee",
                                backgroundColor: "white",
                            }}
                        />
                        <span
                            className={twMerge(
                                "text-sm",
                                selected
                                    ? "text-[#00aeec] font-medium"
                                    : "text-[#6a7282]",
                            )}
                        >
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default TimePeriodSelector;

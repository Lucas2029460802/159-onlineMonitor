import { KeyboardEvent, useState } from "react";

import { IconClose } from "@/assets/svg";

interface MultiValueInputProps {
    label: string;
    placeholder: string;
    values: string[];
    onChange: (values: string[]) => void;
}

export default function MultiValueInput(props: MultiValueInputProps) {
    const { label, placeholder, values, onChange } = props;
    const [inputValue, setInputValue] = useState("");

    const appendValue = () => {
        const nextValue = inputValue.trim();
        if (!nextValue || values.includes(nextValue)) {
            setInputValue("");
            return;
        }

        onChange([...values, nextValue]);
        setInputValue("");
    };

    const removeValue = (value: string) => {
        onChange(values.filter((item) => item !== value));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            appendValue();
        }
    };

    return (
        <div className="rounded-2xl border border-[#d9e3ec] bg-white px-4 py-3 shadow-sm">
            <div className="mb-3 text-sm font-medium text-[#4b5563]">
                {label}
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    className="h-10 flex-1 rounded-xl border border-[#d9e3ec] px-3 text-sm outline-none focus:border-[#00aeec]"
                    onChange={(event) => {
                        setInputValue(event.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    className="h-10 rounded-xl bg-[#00aeec] px-4 text-sm text-white hover:bg-[#36bef2] cursor-pointer"
                    onClick={appendValue}
                >
                    添加
                </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {values.length === 0 && (
                    <div className="text-xs text-[#9ca3af]">暂未添加</div>
                )}
                {values.map((value) => (
                    <div
                        key={value}
                        className="inline-flex items-center gap-1 rounded-full bg-[#e0f7ff] px-3 py-1 text-xs text-[#0079a5]"
                    >
                        <span>{value}</span>
                        <button
                            type="button"
                            className="cursor-pointer text-[#0079a5]"
                            onClick={() => {
                                removeValue(value);
                            }}
                        >
                            <IconClose className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

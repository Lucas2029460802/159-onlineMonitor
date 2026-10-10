import { Select } from "antd";
import { useEffect, useState } from "react";

import { getGroupOptions } from "../util/request";

interface GroupSelectorProps {
    value: string;
    onChange: (groupId: string) => void;
}

export default function GroupSelector({ value, onChange }: GroupSelectorProps) {
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
        [],
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const groups = await getGroupOptions();
                setOptions(
                    groups.flatMap((item) => {
                        const id = String(item.value);
                        if (!(Number(id) > 0)) return [];
                        return [{ value: id, label: item.label }];
                    }),
                );
            } catch {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const selected = Number(value) > 0 ? value : undefined;

    return (
        <div className="flex gap-4 mb-[10px]">
            <span className="text-[#61666D] text-sm whitespace-nowrap ml-2 leading-8">
                分组:
            </span>
            <Select<string>
                showSearch
                placeholder="请选择分组"
                optionFilterProp="label"
                onChange={onChange}
                className="min-w-[240px] max-w-[320px] relative top-0.5"
                style={{ height: "32px" }}
                loading={loading}
                value={loading ? undefined : selected}
                popupMatchSelectWidth={false}
                options={options}
            />
        </div>
    );
}

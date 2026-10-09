import { Select, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { useMemo, useState } from "react";

import { SurveillanceCameraInfo } from "../../types";

import { Message } from "@/util/ui";

interface SurveillanceTreeProps {
    data: SurveillanceCameraInfo[];
    selectedIds: string[];
    onSelect?: (svIds: string[]) => void;
    maxSelect?: number; // 可配置最大数量，默认4
}

export default function SurveillanceTree({
    data,
    selectedIds,
    onSelect,
    maxSelect = 8,
}: SurveillanceTreeProps) {
    const PREFIX_GROUP = "zgroupz";
    // 构建 Tree 数据结构
    const treeData = useMemo<DataNode[]>(() => {
        const groupMap: Record<string, DataNode[]> = {};
        const groupId2Name: Record<string, string> = {};
        // 从各个监控中还原出【组别-监控这样的树状结构】
        data.forEach((item) => {
            if (!Array.isArray(item.groups)) return;
            item.groups.forEach((group, index) => {
                if (!groupMap[group]) groupMap[group] = [];
                if (!groupId2Name[group])
                    groupId2Name[group] = item.groupNames[index];
                groupMap[group].push({
                    title: item.name || `监控 ${item.svId}`,
                    key: `${group}%${item.svId}`, //  注意 key 直接用 svId，但前面加上 group 以区分组，并且“%”作区分，希望你不会遇到名字带有%的监控
                    isLeaf: true,
                });
            });
        });
        return Object.keys(groupMap).map((group) => ({
            title: groupId2Name[group] || group,
            key: `${PREFIX_GROUP}-${group}`, // 注意加前缀避免和 svId 冲突
            children: groupMap[group],
        }));
    }, [data]);

    const [disabled, setDisabled] = useState(false);
    return (
        <>
            <Tree
                treeData={treeData}
                showLine
                multiple
                defaultExpandAll
                disabled={disabled}
                selectedKeys={selectedIds}
                className="select-none"
                autoExpandParent
                onSelect={(selectedKeys, info) => {
                    // 只允许选中叶子节点
                    const key = info.node.key as string;
                    // const svKey = key.slice(key.indexOf("%") + 1); // 最纯粹的key
                    if (key.startsWith(`${PREFIX_GROUP}-`)) return;

                    // throttle逻辑，防止多点
                    setDisabled(true);
                    setTimeout(() => {
                        setDisabled(false);
                    }, 300);

                    let newSelected = [...selectedIds];

                    if (selectedIds.includes(key)) {
                        // 取消选中
                        newSelected = newSelected.filter((id) => id !== key);
                    } else {
                        // 新增选中（限制最多 maxSelect 个）
                        if (selectedIds.length >= maxSelect) {
                            Message.warning(
                                "",
                                `最多可选择 ${maxSelect} 个通道`,
                            );
                            return;
                        }
                        newSelected.push(key);
                    }

                    onSelect?.(newSelected);
                }}
            />
        </>
    );
}

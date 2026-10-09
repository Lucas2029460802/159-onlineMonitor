import { Select, SelectProps, Tag } from "antd";
import { Ref, useEffect, useRef, useState } from "react";

import { strategyNamesArr, svStrategy } from "../../types";

import { IconClose } from "@/assets/svg";
import { Popup } from "@/components/popup";
interface OneManageProps {
    showPopup: boolean;
    onClose: () => void;
    handleSave: (sts: svStrategy[]) => void;
    handleCancel: () => void;
    title: string;
    strategies: svStrategy[];
}
export default function OneManage({
    showPopup,
    title,
    strategies,
    onClose,
    handleSave,
    handleCancel,
}: OneManageProps) {
    const popUpRef = useRef<HTMLDivElement>(null);
    const options: SelectProps["options"] = strategyNamesArr.map((item) => ({
        value: item,
        title: item,
    }));
    options.pop(); // 去掉未知
    const [selectedAlgos, setSelectedAlgos] =
        useState<svStrategy[]>(strategies);
    useEffect(() => {
        setSelectedAlgos(strategies);
    }, [strategies]);
    // TagRender，区分原本的和新添加的
    const tagRender: SelectProps["tagRender"] = (props) => {
        // eslint-disable-next-line react/prop-types
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (
            event: React.MouseEvent<HTMLSpanElement>,
        ) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                color={strategies.includes(value) ? "blue" : "default"}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{
                    fontSize: "14px", // 字体略大
                    padding: "2px 4px 2px 8px ", // 增加内边距
                    borderRadius: "6px", // 圆角更柔和
                    height: "auto", // 防止被固定高度压扁
                    display: "inline-flex",
                    alignItems: "center",
                }}
            >
                {label}
            </Tag>
        );
    };
    return (
        <Popup
            show={showPopup}
            ref={popUpRef}
            className="w-[700px] bg-white border-0 rounded-lg"
        >
            <div className="border-b border-solid border-gray-1 h-16 px-8 flex items-center justify-between">
                <div className="text-blue-2 ">单个监控算法调整</div>
                <IconClose
                    className="text-lg text-gray-2 cursor-pointer"
                    onClick={() => {
                        setSelectedAlgos(strategies);
                        onClose();
                    }}
                />
            </div>
            <div className="p-12 flex flex-col gap-6">
                <div>
                    <div className="mb-2 text-gray-700 text-base font-medium">
                        目标对象
                    </div>
                    <Select
                        defaultValue={title}
                        className="w-full"
                        value={title}
                        disabled
                        options={[{ value: title, label: title }]}
                    />
                </div>
                <div>
                    <div className="mb-2 text-gray-700 text-base font-medium">
                        目标算法
                    </div>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="请选择算法"
                        options={options}
                        value={selectedAlgos}
                        tagRender={tagRender}
                        onChange={setSelectedAlgos}
                        getPopupContainer={() => popUpRef.current!}
                        className="w-full"
                    />
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button
                        className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-blue-1 bg-blue-1 text-white rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#00b5e5] hover:border-[#00b5e5]"
                        onClick={() => {
                            handleSave(selectedAlgos);
                            onClose();
                        }}
                    >
                        保存
                    </button>

                    <button
                        className="min-w-32 h-10 text-base px-4 py-[7px] border border-solid border-gray-1 bg-white text-text-5 rounded-sm flex items-center justify-center cursor-pointer hover:bg-border-2"
                        onClick={() => {
                            setSelectedAlgos(strategies);
                            handleCancel();
                        }}
                    >
                        取消
                    </button>
                </div>
            </div>
        </Popup>
    );
}

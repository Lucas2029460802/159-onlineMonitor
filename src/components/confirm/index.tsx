import { createContext, FC, ReactNode, useState } from "react";

import { Popup } from "../popup";

import { IconLoading } from "@/assets/svg";

interface ConfirmContextType {
    showConfirm: (
        title: string,
        subTitle: string,
        onConfirm: (() => void) | (() => Promise<void>),
        onCancel: (() => void) | (() => Promise<void>),
    ) => void;
    hideConfirm: () => void;
}

export const ConfirmContext = createContext<ConfirmContextType | undefined>(
    undefined,
);

interface ConfirmProviderProps {
    children: ReactNode;
}

export const ConfirmProvider: FC<ConfirmProviderProps> = (props) => {
    const { children } = props;
    const [title, setTitle] = useState<string>("");
    const [subTitle, setSubTitle] = useState<string>("");
    const [visible, setVisible] = useState<boolean>(false);
    const [onConfirm, setOnConfirm] = useState<
        () => void | (() => Promise<void>)
    >(() => {});
    const [onCancel, setOnCancel] = useState<
        () => void | (() => Promise<void>)
    >(() => {});
    const [loading, setLoading] = useState<boolean>(false);

    const showConfirm = (
        title: string,
        subTitle: string,
        onConfirm: () => void,
        onCancel: () => void,
    ) => {
        setTitle(title);
        setSubTitle(subTitle);
        setLoading(false);
        setVisible(true);
        setOnConfirm(() => onConfirm);
        setOnCancel(() => onCancel);
    };

    const hideConfirm = () => {
        setTitle("");
        setSubTitle("");
        setVisible(false);
        setLoading(false);
        setOnConfirm(() => {});
        setOnCancel(() => {});
    };

    return (
        <ConfirmContext.Provider value={{ showConfirm, hideConfirm }}>
            {children}
            <Popup className="p-3 w-[370px] bg-white rounded-sm" show={visible}>
                <div className="mt-[21px] mb-[19px] flex flex-col items-center justify-center">
                    <div className="text-text-7 text-sm leading-6">{title}</div>
                    <div className="text-text-6 text-sm mt-2.5 leading-6">
                        {subTitle}
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2.5 pb-[18px] pt-[10px]">
                    <button
                        className="rounded-sm bg-blue-1 w-[90px] h-7 text-xs text-white border border-solid border-blue-1 hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                        onClick={async () => {
                            if (loading) {
                                return;
                            }
                            setLoading(true);
                            await onConfirm();
                            setLoading(false);
                        }}
                    >
                        {loading && <IconLoading className="text-xs" />}
                        确定
                    </button>
                    <button
                        className="rounded-sm bg-white w-[90px] h-7 text-xs text-[#222] border border-solid border-gray-1 cursor-pointer"
                        onClick={() => {
                            onCancel();
                        }}
                    >
                        取消
                    </button>
                </div>
            </Popup>
        </ConfirmContext.Provider>
    );
};

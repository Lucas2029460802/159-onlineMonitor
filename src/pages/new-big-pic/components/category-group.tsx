import { ConfigProvider } from "antd";

import { SearchTarget } from "../new-big-pic";

import { urlCurEvtType } from "@/pages/bigpic";
import { Message } from "@/util/ui";
interface CategoryGroupProps {
    newSearchNavi: (newTarget: Partial<SearchTarget>) => void;
    evtType: urlCurEvtType;
    setSearchKeywords: React.Dispatch<React.SetStateAction<string>>;
    searchKeywords: string;
}

export const CategoryGroup = ({
    newSearchNavi,
    evtType,
    setSearchKeywords,
    searchKeywords,
}: CategoryGroupProps) => {
    const items = [
        { label: "全部事件", type: "all" },
        { label: "行人", type: "person" },
        // { label: "人脸", type: "face" },
        { label: "机动车", type: "car" },
        { label: "非机动车", type: "bike" },
        { label: "其它", type: "other" },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#00AEEC",
                    borderRadius: 8,
                    colorText: "#61666D",
                },
                components: {
                    Select: {
                        optionSelectedBg: "#DFF6FD",
                        optionSelectedColor: "#00AEEC",
                    },
                },
            }}
        >
            <div className="flex items-center mb-[10px] gap-[10px] flex-wrap">
                <ul id="category-group" className="flex gap-[10px] mb-[10px]">
                    {items.map(({ label, type }) => (
                        <li
                            key={type}
                            onClick={() => {
                                if (type === "face") {
                                    Message.warning(
                                        "人脸暂无搜索功能",
                                        "人脸搜索暂未上线，搜索词将无效，仅可查看所有人脸图像",
                                    );
                                }

                                newSearchNavi({
                                    curPage: 1,
                                    keywords:
                                        type === "face" ? "" : searchKeywords,
                                    curEvtType: type as urlCurEvtType,
                                });
                                setSearchKeywords(searchKeywords);
                            }}
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
            </div>
        </ConfigProvider>
    );
};

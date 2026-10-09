import { useState } from "react";

export enum EvtType {
    All = 0,
    Person = 1,
    Car = 2,
    Other = 3,
}

type evtTypeListItem = {
    t: EvtType;
    d: string;
    key: "" | "Person" | "Bike" | "Car" | "Other";
};
export const evtTypeList: evtTypeListItem[] = [
    { t: EvtType.All, d: "全部", key: "" },
    { t: EvtType.Person, d: "人", key: "Person" },
    { t: EvtType.Car, d: "车辆", key: "Car" },
    { t: EvtType.Other, d: "其它", key: "Other" },
];
export const evtTypeMap = new Map(
    evtTypeList.map((item) => [item.t, { d: item.d, key: item.key }]),
);

interface VideoEvtTypeProps {
    curEvtType: EvtType;
    setCurEvtType: React.Dispatch<React.SetStateAction<EvtType>>;
}
export default function VideoEvtTypeSelector({
    curEvtType,
    setCurEvtType,
}: VideoEvtTypeProps) {
    const [isDivHovered, setIsDivHovered] = useState(false);
    const [isUlHovered, setIsUlHovered] = useState(false);
    return (
        <div
            className="w-[70px] cursor-pointer relative text-center z-[100] "
            onMouseEnter={() => {
                setIsDivHovered(true);
            }}
            onMouseLeave={() => {
                setIsDivHovered(false);
            }}
        >
            {curEvtType === EvtType.All
                ? "全事件"
                : evtTypeMap.get(curEvtType)!.d}
            {(isDivHovered || isUlHovered) && (
                <ul
                    className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col-reverse  w-[140%] text-center 
                shadow-lg  text-white "
                    onMouseEnter={() => {
                        setIsUlHovered(true);
                    }}
                    onMouseLeave={() => {
                        setIsUlHovered(false);
                    }}
                >
                    <div className="h-[20px] bg-transparent cursor-default"></div>
                    {evtTypeList.map((item, index) => (
                        <li
                            key={index}
                            className={`h-9 leading-9 text-sm bg-[hsla(0,0%,8%,0.9)] hover:bg-[rgb(44,44,44)] 
                            ${index === 0 ? "rounded-b-sm" : " "}
                            ${index === evtTypeList.length - 1 ? "rounded-t-sm" : " "}`}
                            onClick={() => {
                                setCurEvtType(item.t);
                                setIsDivHovered(false);
                                setIsUlHovered(false);
                            }}
                        >
                            {item.d}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

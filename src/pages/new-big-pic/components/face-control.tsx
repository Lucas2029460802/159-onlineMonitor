import { useEffect, useRef, useState } from "react";
interface OneSlideBarProps {
    title: string;
    onChangeDebounced: (value: number) => void; // 外部传入回调
    defaultVal: number;
    maxVal: number;
}
function OneSlideBar({
    title,
    onChangeDebounced,
    defaultVal,
    maxVal,
}: OneSlideBarProps) {
    const [value, setValue] = useState(defaultVal);
    const [showBall, setShowBall] = useState(false);
    const timerRef = useRef<number | null>(null);
    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            onChangeDebounced(value);
        }, 500); // 0.5s 后触发外部回调
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [value]);
    return (
        <div className="flex items-center justify-between py-2 rounded-lg gap-x-0.5 relative">
            {/* 左侧文字 */}
            <div className="w-25 px-[5px] h-8 text-[#61666D] select-none leading-8 flex justify-center">
                <span className="mr-2">{title}</span>
            </div>

            {/* 滑条容器（相对定位） */}
            <div className="relative w-40">
                <input
                    type="range"
                    min="0"
                    max={maxVal}
                    value={value}
                    onChange={(e) => {
                        setValue(Number(e.target.value));
                    }}
                    onMouseEnter={() => {
                        setShowBall(true);
                    }}
                    onMouseLeave={() => {
                        setShowBall(false);
                    }}
                    className="w-full h-2 appearance-none rounded-lg bg-[#E6E8EB] cursor-pointer
                                    accent-[#00AEEC] 
                                    [&::-webkit-slider-runnable-track]:rounded-lg
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:h-4
                                    [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-[#00AEEC]
                                    [&::-webkit-slider-thumb]:shadow-md
                                    "
                />
                {showBall && (
                    <div
                        className="absolute w-10 text-center -top-8 px-2 py-1 text-xs rounded-md bg-[#DFF6FD] text-[#00AEEC] shadow"
                        style={{
                            left: `${((160 - 8 - 8) * value) / maxVal - 12}px`, //
                        }}
                    >
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}

interface FaceControlSlidebarProps {
    faceCallback: (value: number) => void;
    clarityCallback: (value: number) => void;
    faceVal: number;
    clarityVal: number;
}

export default function FaceControlSlidebar({
    faceCallback,
    clarityCallback,
    faceVal,
    clarityVal,
}: FaceControlSlidebarProps) {
    return (
        <div className="flex gap-[40px] mb-[10px] text-sm min-w-[1100px] ">
            <OneSlideBar
                title="正脸系数"
                defaultVal={faceVal}
                onChangeDebounced={faceCallback}
                maxVal={30}
            />
            <OneSlideBar
                title="人脸质量"
                defaultVal={clarityVal}
                onChangeDebounced={clarityCallback}
                maxVal={10000}
            />
        </div>
    );
}

import { twMerge } from "tailwind-merge";
import "./load.css";
interface LoadingProps {
    transparent: boolean;
}
export default function Loading({ transparent }: LoadingProps) {
    return (
        <div
            className={twMerge(
                "w-full h-full  absolute z-25 flex justify-center items-center flex-col",
                transparent ? "bg-transparent" : "bg-black",
            )}
        >
            <div className="sk-chase">
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
            </div>
            <div className="relative top-6 left-2 text-white text-sm">
                加载中......
            </div>
        </div>
    );
}

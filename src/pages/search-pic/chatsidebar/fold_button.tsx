import { IconFoldSideBar } from "@/assets/svg";

interface FoldButtonProps {
    onFold: () => void;
}
export default function FoldButton({ onFold }: FoldButtonProps) {
    return (
        <button
            className="w-6 h-6 text-[rgba(13,13,13,0.7)] flex items-center justify-center cursor-ew-resize"
            onClick={onFold}
        >
            <IconFoldSideBar />
        </button>
    );
}

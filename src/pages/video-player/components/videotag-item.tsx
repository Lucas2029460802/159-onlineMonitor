interface VideoTagItemProps {
    title: string;
    num: number | string;
}
export default function VideoTagItem({ num, title }: VideoTagItemProps) {
    return (
        <div className="mr-3 mb-2 inline-flex">
            <div className="text-[13px] text-[#61666D] leading-7 bg-[#F1F2F3] h-7 rounded-[14px] px-3 box-border transition-all ">
                {`${title} ${num}
        `}
            </div>
        </div>
    );
}

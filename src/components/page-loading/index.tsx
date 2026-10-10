import { twMerge } from "tailwind-merge";

export function PageLoading({
    title,
    description,
    className,
}: {
    title: string;
    description?: string;
    className?: string;
}) {
    return (
        <div
            className={twMerge(
                "h-full w-full flex items-center justify-center",
                className,
            )}
        >
            <div className="bg-white rounded-2xl px-8 py-6 border border-[#eef1f4] shadow-[0_10px_30px_rgba(15,23,42,0.05)] flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#dff6fd] border-t-[#00aeec] shrink-0" />
                <div>
                    <div className="text-sm font-medium text-text-4">
                        {title}
                    </div>
                    {description && (
                        <div className="mt-0.5 text-xs text-text-2">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

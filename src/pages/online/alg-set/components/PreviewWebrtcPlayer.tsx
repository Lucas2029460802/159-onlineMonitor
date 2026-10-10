import { useEffect, useRef, useState } from "react";

import { SrsRtcPlayerAsync } from "@/pages/online/people-count/components/Srs_ts";

type PreviewWebRTCPlayerProps = {
    url: string;
};

/** 轻量 WebRTC 预览：始终挂载 video，避免黑屏与时序问题 */
export default function PreviewWebRTCPlayer({ url }: PreviewWebRTCPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sdkRef = useRef<SrsRtcPlayerAsync | null>(null);
    const [status, setStatus] = useState<"idle" | "connecting" | "playing" | "error">(
        "idle",
    );
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !url) {
            setStatus("idle");
            return;
        }

        let cancelled = false;
        setStatus("connecting");
        setErrorText("");

        const sdk = new SrsRtcPlayerAsync();
        sdkRef.current = sdk;
        video.srcObject = sdk.stream;
        video.muted = true;

        const tryPlay = async () => {
            try {
                await sdk.play(url);
                if (cancelled) return;
                // 部分浏览器需在 track 就绪后再 play
                await video.play().catch(() => undefined);
                if (!cancelled) setStatus("playing");
            } catch (e) {
                if (cancelled) return;
                console.error("WebRTC preview play failed", e, url);
                setStatus("error");
                setErrorText("预览播放失败，请检查流地址或重试");
            }
        };

        const onLoaded = () => {
            if (!cancelled) setStatus("playing");
        };
        video.addEventListener("loadeddata", onLoaded);
        void tryPlay();

        return () => {
            cancelled = true;
            video.removeEventListener("loadeddata", onLoaded);
            sdk.close();
            sdkRef.current = null;
            video.srcObject = null;
        };
    }, [url]);

    return (
        <div className="absolute inset-0 w-full h-full bg-black">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain bg-black"
            />
            {(!url || status === "connecting") && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70 pointer-events-none">
                    正在连接预览流…
                </div>
            )}
            {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-sm text-rose-200 bg-black/55 px-4 text-center">
                    <div>{errorText}</div>
                    <div className="text-[11px] text-white/50">
                        若 Network 里只有 OPTIONS，请确认已配置 /rtc 代理并重启前端
                    </div>
                </div>
            )}
        </div>
    );
}

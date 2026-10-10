import { useEffect, useRef } from "react";

import { SrsRtcPlayerAsync } from "@/pages/online/people-count/components/Srs_ts";

type PreviewWebRTCPlayerProps = {
    url: string;
};

/** 轻量 WebRTC 预览，仅绑定播放，不做控制条 */
export default function PreviewWebRTCPlayer({ url }: PreviewWebRTCPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current || !url) return;

        const sdk = new SrsRtcPlayerAsync();
        videoRef.current.srcObject = sdk.stream;
        sdk.play(url);

        return () => {
            sdk.close();
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [url]);

    if (!url) {
        return (
            <div className="w-full h-full flex items-center justify-center text-sm text-white/60">
                正在拉取预览流…
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain bg-black"
        />
    );
}

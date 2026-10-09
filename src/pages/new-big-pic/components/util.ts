import { ImageInfo } from "../new-big-pic";

export const downloadImage = async (curImgInfo: ImageInfo) => {
    try {
        const res = await fetch(
            `${window.origin}/api/video/screenshot?image_path=${curImgInfo.imgSrc}`,
            { credentials: "include" },
        );
        if (!res.ok) throw new Error("下载失败");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = curImgInfo.imgSrc.split("/").pop() || "screenshot.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch {
        alert("下载失败，请稍后重试");
    }
};

export function isOther(n: number) {
    return n === 2;
}

const video = document.createElement("video");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

export const extractFrame = (
    file: File,
    onSeeked: (imgDataUrl: string, width: number, height: number) => void,
    onError?: () => void,
) => {
    const url = URL.createObjectURL(file);

    video.src = url;
    video.load();

    video.onloadedmetadata = () => {
        video.currentTime = 0;
    };

    video.onload = (e) => {
        console.log(e);
    };

    video.onerror = (e) => {
        console.log(e);
        if (onError) onError();
    };

    video.onseeked = () => {
        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            onSeeked(imgDataUrl, video.videoWidth, video.videoHeight);
            URL.revokeObjectURL(url);
        }
    };
};

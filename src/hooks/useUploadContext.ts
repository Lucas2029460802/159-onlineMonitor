import { useEffect, useRef, useState } from "react";

import { api } from "@/api";
import { ROI } from "@/api/type";
import { UploadFileTag } from "@/pages/upload";

export interface UploadContext {
    currentUploaded: number;
    currentSpeed: number;
    timeLeft: number;
    finished: boolean;
    isUploading: boolean;
    error: boolean;
    errMsg: string;
    handleUpload: () => Promise<void>;
    handlePause: () => void;
    handleDelete: () => void;
    doDelete: () => void;
    handleReset: () => void;
    cancelUpload: () => Promise<void>;
}

export const useUploadContext = (
    file: File,
    taskId: number,
    tag?: UploadFileTag,
    immediately?: boolean,
    roi?: ROI,
    onDelete?: () => void,
    onFinished?: () => void,
    onError?: () => void,
): UploadContext => {
    const [currentUploaded, setCurrentUploaded] = useState<number>(0);
    const [currentSpeed, setCurrentSpeed] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const uploadContextRef = useRef<{
        uploadTotal: () => Promise<void>;
        pauseUpload: () => void;
        resumeUpload: () => void;
        resetUpload: () => void;
        cancelUpload: () => Promise<void>;
        isUploading: () => boolean;
    }>(null);
    const cumulativeTimeRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const resetRef = useRef<boolean>(false);
    const [finished, setFinished] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>("");

    const handleUpload = async () => {
        const didUploaded = await api.video.existCheck(file.name, taskId);
        if (didUploaded.Data) {
            setError(true);
            if (onError) onError();
            setErrMsg("视频已上传，请勿重新上传");
            return;
        }
        resetRef.current = false;
        startTimeRef.current = performance.now();
        const total = file.size;
        setError(false);
        setIsUploading(true);
        if (uploadContextRef.current === null) {
            uploadContextRef.current = api.video.createUploadContext(
                file,
                taskId,
                tag ?? "default",
                immediately ?? false,
                roi,
                (progressEvent) => {
                    if (resetRef.current) return;
                    const uploaded = progressEvent.loaded;
                    const speed =
                        (uploaded /
                            (performance.now() -
                                startTimeRef.current +
                                cumulativeTimeRef.current)) *
                        1000;

                    setCurrentUploaded(uploaded < 0 ? 0 : uploaded);
                    setCurrentSpeed(speed);
                    setTimeLeft((total - uploaded) / speed);
                    if (
                        progressEvent.progress !== undefined &&
                        progressEvent.progress >= 1
                    ) {
                        setFinished(true);
                        if (onFinished) onFinished();
                        uploadContextRef.current = null;
                        setIsUploading(false);
                    }
                },
            );
            await uploadContextRef.current.uploadTotal();
        } else {
            if (!uploadContextRef.current.isUploading()) {
                startTimeRef.current = performance.now();
                uploadContextRef.current.resumeUpload();
                setIsUploading(true);
            }
        }
    };

    useEffect(() => {
        // handleUpload();
    }, []);

    const handlePause = () => {
        if (
            uploadContextRef.current &&
            uploadContextRef.current.isUploading()
        ) {
            cumulativeTimeRef.current +=
                performance.now() - startTimeRef.current;
            uploadContextRef.current.pauseUpload();
            setIsUploading(false);
        }
    };

    const handleReset = () => {
        if (uploadContextRef.current) {
            uploadContextRef.current.resetUpload();
            setError(false);
            setFinished(false);
            setIsUploading(false);
            setCurrentUploaded(0);
            setCurrentSpeed(0);
            setTimeLeft(0);
            cumulativeTimeRef.current = 0;
            startTimeRef.current = 0;
            resetRef.current = true;
        }
    };

    const doDelete = () => {
        if (uploadContextRef.current) {
            uploadContextRef.current.resetUpload();
            uploadContextRef.current.cancelUpload();
            uploadContextRef.current = null;
        }
        setFinished(false);
        setIsUploading(false);
        setError(false);
        setErrMsg("");
        setCurrentUploaded(0);
        setCurrentSpeed(0);
        setTimeLeft(0);
        cumulativeTimeRef.current = 0;
        startTimeRef.current = 0;
        resetRef.current = false;
    };

    const handleDelete = () => {
        if (onDelete) onDelete();
    };

    const cancelUpload = async () => {
        if (uploadContextRef.current) {
            await uploadContextRef.current.cancelUpload();
        }
    };

    useEffect(() => {
        return () => {
            uploadContextRef.current = null;
        };
    }, []);

    return {
        currentUploaded,
        currentSpeed,
        timeLeft,
        finished,
        isUploading,
        error,
        errMsg,
        handleUpload,
        handlePause,
        handleDelete,
        doDelete,
        handleReset,
        cancelUpload,
    };
};

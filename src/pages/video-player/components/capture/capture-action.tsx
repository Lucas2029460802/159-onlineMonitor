import { useEffect, useRef, useState } from "react";

import { Point } from "./capture";
import CaptureActionItem from "./capture-action-item";
import CarPlateIcon from "../../assets/capture/car-plate.svg?react";
import ConfirmIcon from "../../assets/capture/confirm.svg?react";
import DownloadIcon from "../../assets/capture/download.svg?react";
import ExitIcon from "../../assets/capture/exit.svg?react";
import FaceEnhanceIcon from "../../assets/capture/face-enhanced.svg?react";

import { api } from "@/api";
function base64ToImageFile(
    base64ImgString: string,
    fileName: string = "default_capture",
): File {
    // 移除data URL前缀以获取纯Base64字符串。例如 'data:image/png;base64,' 前缀会被移除。
    const dataPrefixMatch = base64ImgString.match(/^data:([^;]+);base64,/);
    const mimeType = dataPrefixMatch ? dataPrefixMatch[1] : "image/png"; // 如果无法确定MIME类型，默认使用'image/png'
    const pureBase64String = base64ImgString.split(",")[1];

    // 解码Base64字符串到二进制字符串
    const byteCharacters = atob(pureBase64String);

    // 将二进制字符串转化为无符号8位整数数组
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // 使用Uint8Array创建Blob对象，并指定正确的MIME类型
    const blob = new Blob([byteArray], { type: mimeType });

    // 创建File对象
    const file = new File([blob], fileName, { type: mimeType });

    return file;
}
function saveImgByBase64(img: string, defaultName: string = "截图") {
    const link = document.createElement("a");
    link.href = img;
    link.download = defaultName; // 你可以在这里指定下载文件的名字，默认为'image'
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export enum CurButtonItem {
    None = -1,
    CarPlate = 0,
    HumanFace = 1,
    Exit = 2,
    Save = 3,
    Clip = 4,
}
interface VideoCaptionActionProps {
    containerRef: React.RefObject<HTMLDivElement | null>; // 传入dom保证出现在capture之上
    startDomPos: Point;
    endDomPos: Point;
    cropImageSrc: string | null;
    onExit: () => void;
}

export default function CaptureAction({
    startDomPos,
    endDomPos,
    containerRef,
    onExit,
    cropImageSrc,
}: VideoCaptionActionProps) {
    const ulRef = useRef<HTMLUListElement>(null);
    const [left, setLeft] = useState(-500);
    const [top, setTop] = useState(-500);
    const [transform, setTransform] = useState("");
    const [curButton, setCurButton] = useState<CurButtonItem>(
        CurButtonItem.None,
    );

    useEffect(() => {
        if (!ulRef.current) {
            console.log("null ul");
            return;
        }
        const minX = Math.min(startDomPos.x, endDomPos.x);
        const maxX = Math.max(startDomPos.x, endDomPos.x);
        const minY = Math.min(startDomPos.y, endDomPos.y);
        const maxY = Math.max(startDomPos.y, endDomPos.y);
        const { width, height } = ulRef.current.getBoundingClientRect();
        // 在左侧还是右侧
        if (maxX - width >= 0) {
            setLeft(maxX);
            setTransform("translateX(-100%)");
        } else {
            setLeft(minX);
            setTransform("translateX(0)");
        }
        // 在底边下方还是上方
        setTop(maxY);
        if (minY + height >= window.innerHeight) {
            setTransform((prev) =>
                prev === ""
                    ? `translateY(-${height + 4}px)`
                    : prev + ` translateY(-${height + 4}px)`,
            );
        }
        return;
    }, []);

    if (containerRef.current === null) {
        console.log("video capture action: container不存在");
        return;
    }
    return (
        <ul
            className="fixed flex bg-white z-[102] px-3 gap-1"
            style={{
                left,
                top,
                transform,
            }}
            id="dml-actions"
            ref={ulRef}
        >
            <CaptureActionItem
                icon={CarPlateIcon}
                title="车牌增强"
                curButton={curButton}
                selfButton={CurButtonItem.CarPlate}
                setCurButton={setCurButton}
                onClickLogic={async () => {
                    console.log("cpzq");
                }}
            >
                {
                    <ul className="inline-flex bg-white absolute top-full left-0 translate-y-1.5 rounded-md shadow-md before:content-[''] before:absolute before:top-0 before:left-4 before:-translate-y-2 before:border-4 before:border-transparent before:border-b-amber-100">
                        <li className="w-9 h-9 p-1.5 text-sm leading-6 cursor-default">
                            法1
                        </li>
                        <li className="w-9 h-9 p-1.5 text-sm leading-6 cursor-default">
                            法2
                        </li>
                        <li className="w-9 h-9 p-1.5 text-sm leading-6 cursor-default">
                            法3
                        </li>
                    </ul>
                }
            </CaptureActionItem>
            <CaptureActionItem
                icon={FaceEnhanceIcon}
                title="人脸增强"
                curButton={curButton}
                setCurButton={setCurButton}
                selfButton={CurButtonItem.HumanFace}
                onClickLogic={() => {
                    console.log("rlzq");
                }}
            >
                {
                    <ul className="inline-flex bg-white absolute top-full left-0 translate-y-1.5 rounded-md shadow-md before:content-[''] before:absolute before:top-0 before:left-4 before:-translate-y-2 before:border-4 before:border-transparent before:border-b-amber-100">
                        <li
                            className="w-9 h-9 p-1.5 text-sm leading-6 cursor-default"
                            onClick={async () => {
                                if (cropImageSrc === null) return;
                                const res = await api.enhance.face(
                                    [base64ToImageFile(cropImageSrc)],
                                    "codeformer",
                                );
                                console.log("jj");

                                console.log(
                                    `data:image/jpeg;base64,${res.results[0]}`,
                                );
                            }}
                        >
                            法1
                        </li>
                        <li className="w-9 h-9 p-1.5 text-sm leading-6 cursor-default">
                            法2
                        </li>
                    </ul>
                }
            </CaptureActionItem>

            <CaptureActionItem
                icon={DownloadIcon}
                title="保存截图"
                curButton={curButton}
                setCurButton={setCurButton}
                selfButton={CurButtonItem.Save}
                onClickLogic={() => {}}
            >
                {
                    <ul className="inline-flex bg-white absolute top-full left-0 translate-y-1.5 rounded-md shadow-md before:content-[''] before:absolute before:top-0 before:left-4 before:-translate-y-2 before:border-4 before:border-transparent before:border-b-amber-100">
                        <li
                            className="w-12 h-9 p-1.5 text-sm leading-6 text-center select-none"
                            onClick={() => {
                                if (cropImageSrc === null) return;
                                saveImgByBase64(cropImageSrc);
                            }}
                        >
                            原图
                        </li>
                        <li className="w-9 h-9 p-1.5 text-sm leading-6 select-none">
                            AI
                        </li>
                    </ul>
                }
            </CaptureActionItem>
            <CaptureActionItem
                icon={ExitIcon}
                title="退出"
                curButton={curButton}
                setCurButton={setCurButton}
                selfButton={CurButtonItem.Exit}
                onClickLogic={() => {
                    onExit();
                }}
            />
            {typeof ClipboardItem !== "undefined" && (
                <CaptureActionItem
                    icon={ConfirmIcon}
                    title="确定,保存到剪贴板"
                    curButton={CurButtonItem.Clip}
                    setCurButton={setCurButton}
                    selfButton={CurButtonItem.Clip}
                    onClickLogic={() => {
                        if (cropImageSrc === null) return;
                        const img = new Image();
                        img.src = cropImageSrc;
                        img.onload = () => {
                            const canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext("2d");
                            if (ctx === null) {
                                onExit();
                                return;
                            }
                            ctx.drawImage(img, 0, 0);
                            canvas.toBlob(function (blob) {
                                if (blob === null) {
                                    alert("无法创建图片对象至剪贴版");
                                    onExit();
                                    return;
                                }
                                const item = new ClipboardItem({
                                    "image/png": blob,
                                });
                                navigator.clipboard
                                    .write([item])
                                    .then(function () {
                                        console.log("图像已成功复制到剪贴板");
                                    })
                                    .catch(function (err) {
                                        console.error(
                                            "无法将图像复制到剪贴板: ",
                                            err,
                                        );
                                    })
                                    .finally(() => {
                                        onExit();
                                    });
                            }, "image/png");
                        };
                    }}
                />
            )}
        </ul>
    );
}

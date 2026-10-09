import { SmallDashOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { FC, HTMLProps, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import SetVideoTime from "./setTime";

import { api } from "@/api";
import { User } from "@/api/type";
import { IconMenu } from "@/assets/svg";
import { ConfirmContext } from "@/components/confirm";
import Dropdown from "@/components/dropdown";
import Image from "@/components/image";
import { VideoCrop } from "@/pages/upload/components/video-crop";
import { date2string, time2string } from "@/util/time";

const handleDownload = (videoId: number, userId: number) => {
    const link = document.createElement("a");
    link.href =
        "/api/video/download?video_id=" +
        videoId.toString() +
        "&user_id=" +
        userId.toString();

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export interface CardProps extends HTMLProps<HTMLDivElement> {
    vid: number;
    url: string;
    filename: string;
    duration: number;
    updateTime: Date;
    owner: User;
    onRefresh?: () => void;
    startTime: Date;
    fromShare?: boolean;
}
type RightButtonProps = {
    size: "small";
    type: "text";
    className: string;
};

export const Card: FC<CardProps> = (props) => {
    const {
        vid,
        className,
        url,
        filename,
        duration,
        owner,
        onRefresh,
        updateTime,
        fromShare = false,
        startTime,
        ...rest
    } = props;
    const [showDropdownButton, setShowDropdownButton] =
        useState<boolean>(false);
    const [hover, setHover] = useState<boolean>(false);
    const Confirm = useContext(ConfirmContext);

    const handleMouseEnter = () => {
        setShowDropdownButton(true);
    };

    const handleMouseLeave = () => {
        setShowDropdownButton(false);
    };

    const [imgWH, setImgWH] = useState({ width: 0, height: 0 });
    const handImageSizeLoad = (width: number, height: number) => {
        setImgWH({ width, height });
    };
    const [showVideoCrop, setShowVideoCrop] = useState(false);
    const [showVideoTime, setShowVideTime] = useState(false);
    const { taskId } = useParams();

    // button
    const commonButtonProps: RightButtonProps = {
        size: "small",
        type: "text",
        className:
            "h-[22px] px-2.5 text-[12px] !bg-[#f3f4f6 ] !text-[#99a1af] hover:!bg-[#dff2fe] hover:!text-[#0084d1] transition-all border-none shadow-none flex items-center justify-center rounded",
    };

    const deleteButtonProps: RightButtonProps = {
        size: "small",
        type: "text",
        className:
            "h-[22px] px-2.5 text-[12px] !bg-[#f3f4f6 ] !text-[#99a1af] hover:!bg-[#ffe2e2] hover:!text-[#e7000b] transition-all border-none shadow-none flex items-center justify-center rounded",
    };
    return (
        <div
            // className={twMerge("mt-6 select-none", className)}
            className={twMerge("mt-6 ", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...rest}
        >
            <Image
                className="relative rounded-md overflow-hidden cursor-pointer"
                src={`/api/video/image?image_path=${url}`}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => {
                    const paths = location.pathname.split("/");
                    window.open(
                        `/${paths[1]}/${taskId}/player?id=${vid}`,
                        "_blank",
                    );
                }}
                onSizeChange={handImageSizeLoad}
            >
                <div
                    className={twMerge(
                        "absolute left-0 bottom-0 z-[2] w-full h-[38px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.8)_100%)] px-2 pt-4 pb-1.5",
                        "flex justify-end items-center",
                        "opacity-0 transition-opacity",
                        hover && "opacity-100",
                    )}
                >
                    <div className="text-[13px] leading-[18px] text-white">
                        {time2string(duration)}
                    </div>
                </div>
            </Image>
            <div className="mt-2.5 min-h-16 ">
                <div className="relative flex items-start justify-start ">
                    <div
                        className="h-11 pr-[30px] box-border w-full break-words text-[15px] font-medium text-ellipsis line-clamp-2 cursor-pointer"
                        onClick={() => {
                            const paths = location.pathname.split("/");
                            window.open(
                                `/${paths[1]}/${taskId}/player?id=${vid}`,
                                "_blank",
                            );
                        }}
                    >
                        {filename}
                    </div>
                    <Dropdown
                        position="bottom-left"
                        className={twMerge(
                            "absolute top-0.5 right-0 text-lg hover:bg-hover-1 rounded-sm cursor-pointer",
                            // showDropdownButton ? "visible" : "invisible", 警官想要一直看见
                        )}
                        style={{
                            transition: showDropdownButton
                                ? ""
                                : "visibility 0s linear 150ms",
                        }}
                    >
                        <div
                            className="text-icon-1"
                            data-dropdown-type="button"
                        >
                            <IconMenu />
                        </div>
                        <div
                            className={
                                "w-[142px] py-3 rounded-xl bg-dropdown-bg-1 border-solid border border-border-1 box-border shadow-[0_8px_40px_rgba(0,0,0,.1)]"
                            }
                            data-dropdown-type="menu"
                        >
                            <div
                                className="h-10 text-text-1 text-sm hover:bg-hover-1 transition-colors flex items-center justify-center"
                                onClick={() => {
                                    Confirm?.showConfirm(
                                        "确定要下载该视频吗？",
                                        "确认后浏览器会自动开始下载",
                                        () => {
                                            handleDownload(vid, owner.Id);
                                            Confirm.hideConfirm();
                                        },
                                        () => {
                                            Confirm.hideConfirm();
                                        },
                                    );
                                }}
                            >
                                下载
                            </div>
                            <div
                                className="h-10 text-text-1 text-sm hover:bg-hover-1 transition-colors flex items-center justify-center"
                                onClick={() => {
                                    setShowDropdownButton(false);
                                    setShowVideoCrop(true);
                                }}
                            >
                                重载
                            </div>
                            <div
                                className="h-10 text-text-1 text-sm hover:bg-hover-1 transition-colors flex items-center justify-center"
                                onClick={() => {
                                    setShowDropdownButton(false);
                                    setShowVideTime(true);
                                }}
                            >
                                设置时间
                            </div>
                            {!fromShare && (
                                <div
                                    className="h-10 text-red-400 text-sm hover:bg-hover-1 transition-colors flex items-center justify-center"
                                    onClick={() => {
                                        Confirm?.showConfirm(
                                            "确定要删除吗？",
                                            "该操作无法撤回",
                                            async () => {
                                                await api.video.delete(vid);
                                                if (onRefresh) onRefresh();
                                                Confirm.hideConfirm();
                                            },
                                            () => {
                                                Confirm.hideConfirm();
                                            },
                                        );
                                    }}
                                >
                                    删除
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
                <div className="h-[17px] mt-1 text-[13px] text-text-2 flex items-center">
                    <div className="min-w-15 mr-1">来源: {owner.Station}</div>
                    <div className="pl-1 border-l-gray-1 border-l-1">
                        {/* 视频时间： */}
                        {startTime.getFullYear() === 2100
                            ? "识别异常, 请手动设定"
                            : date2string(startTime)}
                    </div>
                </div>
                <div className="h-[22px] mt-2 flex items-center gap-4 w-full justify-start">
                    {/* 下载按钮 */}
                    <Button
                        {...commonButtonProps}
                        onClick={() => {
                            Confirm?.showConfirm(
                                "确定要下载该视频吗？",
                                "确认后浏览器会自动开始下载",
                                () => {
                                    handleDownload(vid, owner.Id);
                                    Confirm.hideConfirm();
                                },
                                () => Confirm.hideConfirm(),
                            );
                        }}
                    >
                        下载
                    </Button>

                    <Button
                        {...commonButtonProps}
                        onClick={() => {
                            setShowDropdownButton?.(false);
                            setShowVideoCrop?.(true);
                        }}
                    >
                        重载
                    </Button>

                    {/* 设置时间按钮 */}
                    <Button
                        {...commonButtonProps}
                        onClick={() => {
                            setShowDropdownButton?.(false);
                            setShowVideTime?.(true);
                        }}
                    >
                        设置时间
                    </Button>
                    {/* 删除按钮 */}
                    {!fromShare && (
                        <Button
                            {...deleteButtonProps}
                            onClick={() => {
                                Confirm?.showConfirm(
                                    "确定要删除吗？",
                                    "该操作无法撤回",
                                    async () => {
                                        await api.video.delete(vid);
                                        if (onRefresh) onRefresh();
                                        Confirm.hideConfirm();
                                    },
                                    () => Confirm.hideConfirm(),
                                );
                            }}
                        >
                            删除
                        </Button>
                    )}
                </div>
                {showVideoCrop && (
                    <VideoCrop
                        firstFrame={`/api/video/image?image_path=${url}`}
                        imgWidth={imgWH.width}
                        imgHeight={imgWH.height}
                        defaultValue={{
                            cropX: 0,
                            cropY: 0,
                            resolutionX: imgWH.width,
                            resolutionY: imgWH.height,
                        }}
                        onClose={() => {
                            setShowVideoCrop(false);
                        }}
                        onConfirm={(
                            _,
                            resolutionX,
                            resolutionY,
                            cropX,
                            cropY,
                        ) => {
                            api.process
                                .start(
                                    vid,
                                    cropX,
                                    cropY,
                                    resolutionX,
                                    resolutionY,
                                )
                                .then(() => {
                                    if (onRefresh) onRefresh();
                                    setShowVideoCrop(false);
                                });
                        }}
                    />
                )}
                {showVideoTime && (
                    <SetVideoTime
                        onRefresh={onRefresh}
                        onClose={() => {
                            setShowVideTime(false);
                        }}
                        vid={vid}
                    ></SetVideoTime>
                )}
            </div>
        </div>
    );
};

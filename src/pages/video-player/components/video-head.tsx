import { useState } from "react";

import ForbiddenIcon from "../assets/head/icon-forbidden.svg?react";
import HelpIcon from "../assets/head/icon-help.svg?react";
import VideoUploadIcon from "../assets/head/icon-video-upload.svg?react";

import { Table } from "@/components/table/index";
function transformUploadTime(uploadTime: string) {
    const date = new Date(uploadTime);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // 加1是因为getMonth()返回值为0-11
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}
interface VideoHeadProps {
    videoName: string;
    uploadTime: string;
}

export default function VideoHead({ videoName, uploadTime }: VideoHeadProps) {
    const [showHelp, setShowHelp] = useState(false);
    return (
        <div className="box-border pt-[22px] h-[104px] z-[1000]">
            <h1 className=" flex ">
                <span className="text-xl leading-7 whitespace-nowrap overflow-ellipsis">
                    {videoName}
                </span>
            </h1>
            <div className="flex h-6 items-center mt-1.5 text-[#9499a0]">
                <div className=" flex text-xs mr-3">
                    <VideoUploadIcon className="mr-1 w-5" />
                    <div className="h-5 leading-5">
                        {transformUploadTime(uploadTime)}(视频上传日期)
                    </div>
                </div>
                <div className=" flex text-xs mr-3 items-center">
                    <ForbiddenIcon className="mr-1 text-[#fb2c36]" />{" "}
                    <div className="h-5 leading-5"> 内部使用，禁止外传</div>
                </div>
                <div
                    className=" flex text-xs mr-3 relative z-[30]   "
                    onMouseEnter={() => setShowHelp(true)}
                    onMouseLeave={() => setShowHelp(false)}
                >
                    <HelpIcon className="mr-1 w-5" />
                    <div className="h-5 leading-5 whitespace-nowrap">
                        帮助说明
                    </div>
                    {showHelp && (
                        <div className="absolute top-full  w-[400px] ">
                            <Table
                                titles={["快捷按键", "功能"]}
                                flexes={[2, 5]}
                                needTransparent={false}
                                needRounded={false}
                                rows={[
                                    ["A / a键", "跳转到上一个有事件时间点"],
                                    ["D / d键", "跳转到下一个有事件时间点"],
                                    ["空格", "暂停 / 播放"],
                                    ["轻点右键", "快进5秒"],
                                    ["轻点左键", "快退5秒"],
                                    ["按住右键", "十倍速播放"],
                                    ["上键", "增大音量"],
                                    ["下键", "降低音量"],
                                    ["Esc", "退出全屏 / 退出截图"],
                                    ["双击视频", "退出 / 进入全屏 "],
                                ]}
                            ></Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

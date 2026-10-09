import { ConfigProvider, Switch } from "antd";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import DrawPopup, { FlowLine } from "./DrawPopup";
import { SurveillanceCameraInfo } from "../../types";
import { convertFlowlineToNumberArr } from "../../util";

import { api } from "@/api";
import { $PC } from "@/store/peoplecount";
import { Message } from "@/util/ui";

interface PeopleCountDrawProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    data: SurveillanceCameraInfo | null;
}

export default function PeopleCountDraw({
    videoRef,
    data,
}: PeopleCountDrawProps) {
    const hasSignal = !!data;
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState<boolean>(
        data?.people_flow_status ?? false,
    );
    useEffect(() => {
        setEnabled(data?.people_flow_status ?? false);
    }, [data?.people_flow_status]);

    const handleSwitchChange = async (checked: boolean) => {
        if (!hasSignal || !data) return;
        // checked 是变化之后的值，例如原本关闭，点击后checked为true
        if (checked) {
            //  当前是关闭 → 想开启 → 弹出绘制框
            setShowPopup(true);
        } else {
            //  当前是开启 → 想关闭 → 直接发请求关闭
            setLoading(true);
            try {
                await api.online.stopPc(data.device_id, data.channel_id);
                $PC.update("stop pc", (p) => {
                    const oriSvInfo = p.svInfo.find(
                        (i) => i.svId === data.svId,
                    );
                    if (!oriSvInfo) return;
                    oriSvInfo.people_flow_status = false;
                    oriSvInfo.line_points_entrance = null;
                    oriSvInfo.line_points_out_in2out = null;
                });
                setEnabled(false);
                Message.success("", "人流检测已关闭");
            } catch (err) {
                Message.warning("", "关闭失败，请重试");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    //  Popup 内绘制完成的回调
    const handleDrawComplete = async (
        success: boolean,
        line1: FlowLine | null,
        line2: FlowLine | null,
        line3: FlowLine | null,
        line4: FlowLine | null,
    ) => {
        // 关闭popup时没有成功，那就取消打开
        if (!success) {
            setEnabled(false);
            setShowPopup(false);
            return;
        }
        if (!data) return;
        setLoading(true);
        try {
            // 调用后端开启人流算法
            await api.online.startPc(data.device_id, data.channel_id, [
                line1!, // success时，一定是有值的
                line2!,
                line3!,
                line4!,
            ]);
            // 修改本地数据
            $PC.update("open pc", (p) => {
                const oriSvInfo = p.svInfo.find((i) => i.svId === data.svId);
                if (!oriSvInfo) return;
                oriSvInfo.people_flow_status = true;
                oriSvInfo.line_points_entrance = [line1!, line2!, line3!].map(
                    convertFlowlineToNumberArr,
                );
                oriSvInfo.line_points_out_in2out = convertFlowlineToNumberArr(
                    line4!,
                );
            });
            setEnabled(true);
            Message.success("", "人流检测已开启");
        } catch (err) {
            setEnabled(false);
            Message.warning("", "开启失败，请重试");
            console.error(err);
        } finally {
            setLoading(false);
            setShowPopup(false);
        }
    };
    return (
        <>
            <div className={twMerge("flex")}>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: "#00aeec",
                        },
                    }}
                >
                    <Switch
                        loading={loading}
                        checkedChildren="点此关闭"
                        unCheckedChildren="点此启动"
                        checked={enabled}
                        disabled={!hasSignal}
                        onChange={handleSwitchChange}
                    />
                </ConfigProvider>
            </div>

            <DrawPopup
                showPopup={showPopup}
                videoRef={videoRef}
                onClose={(success, line1, line2, line3, line4) =>
                    handleDrawComplete(success, line1, line2, line3, line4)
                }
            />
        </>
    );
}

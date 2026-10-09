// --- 子组件: 步骤一 (创建组 & 选择监控) ---

import { Button, Card, Form, Input, Select } from "antd";
import { useMemo } from "react";

import { DeploymentData } from "..";

import { api } from "@/api";
import { oneSv } from "@/api/type";

export const PhaseOne = ({
    initialData,
    allMonitors,
    onNext,
}: {
    initialData: DeploymentData;
    allMonitors: oneSv[];
    onNext: (data: Partial<DeploymentData>) => void;
}) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        let values;
        try {
            values = await form.validateFields();
        } catch (e) {}
        try {
            await api.online.validSvChoose(
                values.groupName,
                values.groupMonitorIds,
            );
            onNext({
                groupName: values.groupName,
                groupMonitorIds: values.groupMonitorIds,
            });
        } catch (e) {}
    };

    // 将监控数据转换为 Select 选项
    const options = useMemo(
        () =>
            allMonitors.map((m) => ({
                label: m.name,
                value: m.Id,
                key: m.Id,
            })),
        [allMonitors],
    );

    return (
        <div className="max-w-3xl mx-auto py-10">
            <Card title="第一阶段：建立布控组" className="shadow-md">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        groupName: initialData.groupName,
                        groupMonitorIds: initialData.groupMonitorIds,
                    }}
                >
                    <Form.Item
                        label="布控组名称"
                        name="groupName"
                        rules={[
                            { required: true, message: "请输入布控组名称" },
                        ]}
                    >
                        <Input
                            placeholder="例如：西区商场安全布控组"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="选择本组监控资源"
                        name="groupMonitorIds"
                        rules={[
                            { required: true, message: "请至少选择一个监控" },
                        ]}
                        help="此处从全量监控池中筛选出本组需要用到的所有监控"
                    >
                        <Select
                            mode="multiple"
                            size="large"
                            placeholder="搜索并选择监控..."
                            style={{ width: "100%" }}
                            options={options}
                            optionFilterProp="label"
                            maxTagCount="responsive"
                            listHeight={400}
                        />
                    </Form.Item>

                    <div className="flex justify-end mt-8">
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                        >
                            下一步：配置算法
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

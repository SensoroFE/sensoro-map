import React from "react";
import { Form, Divider, Button, Space } from "antd";
import { PositionSelector } from "@sensoro/sensoro-map";

export default () => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.info("表单value字段changed=====>", values);
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleInit = () => {
    form.setFieldsValue({
      position: {
        lnglat: [116.905163, 40.006047],
        location: "河北省廊坊市三河市高楼镇三河福成酿酒有限公司",
      },
    });
  };

  return (
    <div>
      <Form layout="vertical" form={form}>
        <Form.Item
          label="位置信息"
          name="position"
          rules={[{ required: true, message: "位置信息不能为空" }]}
        >
          <PositionSelector small style={{ width: 550, height: 300 }} />
        </Form.Item>
      </Form>

      <Divider />

      <Space>
        <Button onClick={handleSubmit}>提交表单</Button>
        <Button onClick={handleReset}>重置表单</Button>
        <Button onClick={handleInit}>设置初始值</Button>
      </Space>
    </div>
  );
};

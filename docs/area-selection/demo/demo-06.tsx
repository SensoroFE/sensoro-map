import React from "react";
import { Form, Space, Button } from "antd";
import { AreaSelection } from "@sensoro/sensoro-map";
import { devices } from "./data-source";

const { Item } = Form;

export default () => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
  };

  const handleSetData = () => {
    form.setFieldsValue({
      path: [
        [116.078881, 40.041531],
        [116.076232, 39.766118],
        [116.403458, 39.769173],
        [116.392859, 40.050658],
      ],
    });
  };

  const handleGetData = () => {
    console.log(form.getFieldValue("path"));
  };

  return (
    <Form form={form}>
      <Item name="path" initialValue={null}>
        <AreaSelection
          style={{ height: 500 }}
          deviceKey="sn"
          list={devices}
          onChange={(value) => {
            console.log(value);
          }}
        />
      </Item>

      <Space>
        <Button onClick={handleReset}>重置</Button>
        <Button onClick={handleSetData}>设置数据</Button>
        <Button onClick={handleGetData}>获取数据</Button>
      </Space>
    </Form>
  );
};

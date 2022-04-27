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
      path: {
        type: "Polygon",
        coordinates: [
          [
            [116.466689, 40.000484],
            [116.464576, 39.979757],
            [116.510816, 39.976522],
            [116.500263, 39.99681],
          ],
        ],
      },
    });
  };

  const handleGetData = () => {
    console.log(form.getFieldValue("path"));
  };

  return (
    <Form form={form}>
      <Item
        name="path"
        initialValue={{
          type: "Polygon",
          coordinates: [[]],
        }}
      >
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

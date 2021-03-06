---
title: AreaSelection 设备框选组件
nav:
  title: 组件
  path: /components
group:
  path: /business
  title: 业务组件
---

# AreaSelection 地图设备框选组件

## 代码演示

### 普通设备

<code src="./demo/demo-01.tsx" />

### 表单示例

<code src="./demo/demo-02.tsx" />

### 只读状态 禁区模式

<code src="./demo/demo-03.tsx" />

### 围栏模式 只读

<code src="./demo/demo-04.tsx" />

### 表单示例 geoJson 格式数据

<code src="./demo/demo-05.tsx" />

### 表单示例 空数据

<code src="./demo/demo-06.tsx" />

## API

| 参数          | 说明                                           | 类型                      | 默认值    | 版本 |
| ------------- | ---------------------------------------------- | ------------------------- | --------- | ---- |
| className     | 额外的样式类                                   | string                    | --        | --   |
| style         | 额外的样式                                     | CSSProperties             | --        | --   |
| value         | 已经选择的设备                                 | string[]                  | --        | --   |
| readonly      | 只读模式                                       | boolean                   | false     | --   |
| transformData | 是否做数据处理                                 | boolean                   | true      | --   |
| deviceKey     | 指定灵思设备的唯一标识                         | string                    | `cid`     | --   |
| list          | 设备集合                                       | Array                     | --        | --   |
| onChange      | 选择设备改变的回调                             | (value: string[]) => void | --        | --   |
| mode          | 模式 "FORBIDDEN_AREA" (禁区) "FENCING"（围栏） | string                    | "FENCING" | --   |

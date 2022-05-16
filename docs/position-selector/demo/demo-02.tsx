import React from "react";
import { PositionSelector } from "@sensoro/sensoro-map";

export default () => {
  return (
    <PositionSelector
      value={{ lnglat: [116.475014,39.991254] }}
      onChange={(val) => {
        console.info("=====>坐标change", val);
      }}
      style={{ width: 400, height: 300 }}
      small
    />
  );
};

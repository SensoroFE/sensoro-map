import React from "react";
import { PositionSelector } from "@sensoro/sensoro-map";

export default () => {
  return (
    <PositionSelector
      value={{ lnglat: [116.378517, 39.865246] }}
      onChange={(val) => {
        console.info("=====>坐标change", val);
      }}
      style={{ width: 600, height: 400 }}
    />
  );
};

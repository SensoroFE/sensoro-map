import React from "react";
import { PositionSelector } from "@sensoro/sensoro-map";

export default () => {
  return (
    <PositionSelector
      value={{ lnglat: [111.193707, 30.676151], location: "宜昌市第八中学" }}
      onChange={(val) => {
        console.info("=====>坐标change", val);
      }}
      style={{ width: 600, height: 400 }}
    />
  );
};

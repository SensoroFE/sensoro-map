import React from "react";
import { PositionSelector } from "@sensoro/sensoro-map";

export default () => {
  return (
    <PositionSelector
      onChange={(val) => {
        console.info("=====>坐标change", val);
      }}
      style={{ width: 400, height: 300 }}
      small
    />
  );
};

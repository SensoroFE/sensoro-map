import React from "react";
import { PositionSelector } from "@sensoro/sensoro-map";

export default () => {
  return (
    <PositionSelector
      onChange={(val) => {
        console.info("=====>坐标change", val);
      }}
      style={{ width: 600, height: 400 }}
      small
    />
  );
};

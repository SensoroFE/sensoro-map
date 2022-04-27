import React from "react";
import { AreaSelection } from "@sensoro/sensoro-map";
import { devices } from "./data-source";

export default () => {
  return (
    <AreaSelection
      readonly
      mode="FORBIDDEN_AREA"
      style={{ width: 550, height: 300 }}
      value={[
        [116.464877, 40.01446],
        [116.46224, 39.984772],
        [116.5112, 39.984684],
        [116.503289, 40.015865],
        [116.503289, 40.015865],
      ]}
      list={devices}
    />
  );
};

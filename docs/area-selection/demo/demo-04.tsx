import React from "react";
import { AreaSelection } from "@sensoro/sensoro-map";
import { devices, GBDevices } from "./data-source";

export default () => {
  return (
    <AreaSelection
      mode="FENCING"
      readonly
      value={[
        [116.464877, 40.01446],
        [116.46224, 39.984772],
        [116.5112, 39.984684],
        [116.503289, 40.015865],
        [116.503289, 40.015865],
      ]}
      style={{ height: 500 }}
      list={devices}
      listGB={GBDevices}
    />
  );
};

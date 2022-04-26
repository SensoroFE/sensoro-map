import React from "react";
import { AreaSelection } from "@sensoro/sensoro-map";
import { devices } from "./data-source";

export default () => {
  return (
    <AreaSelection
      style={{ height: 500 }}
      deviceKey="sn"
      list={devices}
      readonly={false}
      value={[
        [116.403322, 39.920255],
        [116.410703, 39.897555],
        [116.402292, 39.892353],
        [116.389846, 39.891365],
      ]}
      onChange={(value) => {
        console.log(value, JSON.stringify(value), "onChange---");
      }}
    />
  );
};

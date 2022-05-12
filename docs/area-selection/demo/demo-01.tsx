import React from "react";
import { AreaSelection } from "@sensoro/sensoro-map";
import { devices } from "./data-source";
import { Mode } from "@sensoro/sensoro-map/es/area-selection/interface";

export default () => {
  return (
    <AreaSelection
      style={{ height: 500 }}
      deviceKey="sn"
      list={devices}
      mode={Mode.FORBIDDEN_AREA}
      value={[
        [116.489431, 40.000322],
        [116.490475, 39.99659],
        [116.496565, 39.993924],
        [116.496304, 39.999389],
      ]}
      onChange={(value) => {
        console.log(value, "onChange---");
      }}
    />
  );
};

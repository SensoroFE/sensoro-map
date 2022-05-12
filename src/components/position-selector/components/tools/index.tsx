import React, { FC } from "react";
import { useMap } from "@pansy/react-amap";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { LngLatArray } from "../../../../map/types";

interface ToolsProps {
  prefixCLs?: string;
  position?: LngLatArray;
}

export const Tools: FC<ToolsProps> = ({ prefixCLs, position }) => {
  const { map } = useMap();

  const handlePlusClick = () => {
    map?.zoomIn();
  };

  const handleMinusClick = () => {
    map?.zoomOut();
  };

  return (
    <div className={prefixCLs}>
      <div className={`${prefixCLs}-zooms`}>
        <div className={`${prefixCLs}-item`} onClick={handlePlusClick}>
          <PlusOutlined />
        </div>
        <div className={`${prefixCLs}-item`} onClick={handleMinusClick}>
          <MinusOutlined />
        </div>
      </div>
    </div>
  );
};

Tools.defaultProps = {
  prefixCLs: "sen-map-position-tools",
};

export default Tools;

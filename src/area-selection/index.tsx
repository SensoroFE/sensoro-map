import React, { useContext, useState } from "react";
import classNames from "@pansy/classnames";
import { Map } from "../map";
import { ConfigContext } from "../config-provider";
import AreaDeviceSelection from "./area-device-selection";
import type { AreaDeviceSelectionProps } from "./area-device-selection";
import "./style";
export type { AreaDeviceSelectionProps as AreaSelectionProps };
export const AreaSelection: React.FC<AreaDeviceSelectionProps> = ({
  className,
  style,
  ...rest
}) => {
  /** 地图主题 */
  const [themeStatus, setThemeStatus] = useState<boolean>(false);
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls("area-selection");

  return (
    <Map
      className={classNames(classNames, {
        [`${prefixCls}`]: true,
      })}
      style={style}
      features={themeStatus ? [] : ["bg", "point", "road"]}
    >
      <AreaDeviceSelection
        prefixCls={prefixCls}
        themeStatus={themeStatus}
        setThemeStatus={setThemeStatus}
        {...rest}
      />
    </Map>
  );
};

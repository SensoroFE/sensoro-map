import React, { useContext, useState, useRef, useEffect, useMemo } from "react";
import classNames from "@pansy/classnames";
import { Map } from "../map";
import { ConfigContext } from "../config-provider";
import AreaDeviceSelection from "./area-device-selection";
import type { AreaDeviceSelectionProps } from "./area-device-selection";
import "./style";
export type { AreaDeviceSelectionProps as AreaSelectionProps };

const stateMapTips = {
  start: "单击地图绘制范围",
  drawing: "双击左键结束绘制",
  stop: "",
};
export const AreaSelection: React.FC<AreaDeviceSelectionProps> = ({
  className,
  style,
  ...rest
}) => {
  /** 地图主题 */
  const [themeStatus, setThemeStatus] = useState<boolean>(false);
  const [mouseState, setMouseState] = useState<{
    position: { x: number; y: number };
    state: "start" | "drawing" | "stop";
  }>({
    position: {
      x: 0,
      y: 0,
    },
    state: "stop",
  });
  const [draw, setDraw] = useState<boolean>(false);
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls("area-selection");
  const mapRef = useRef<any>(null);

  const onMousemove = (e) => {
    setMouseState((o) => ({
      ...o,
      position: { x: e.offsetX, y: e.offsetY },
    }));
  };
  const onMousedown = (e) => {
    setMouseState((o) => ({
      ...o,
      state: draw ? "drawing" : "stop",
    }));
  };

  useEffect(() => {
    if (draw) {
      mapRef.current.addEventListener("mousemove", onMousemove);
      mapRef.current.addEventListener("mousedown", onMousedown);
    }
    return () => {
      mapRef?.current?.removeEventListener?.("mousemove", onMousemove);
      mapRef?.current?.removeEventListener?.("mousedown", onMousedown);
    };
  }, [mapRef.current, draw]);

  useEffect(() => {
    setMouseState((o) => ({ ...o, state: draw ? "start" : "stop" }));
  }, [draw]);

  const tips = useMemo(() => {
    return stateMapTips?.[mouseState.state];
  }, [mouseState]);

  return (
    <div ref={mapRef}>
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
          draw={draw}
          setDraw={setDraw}
          mouseState={mouseState}
          tips={tips}
          {...rest}
        />
      </Map>
    </div>
  );
};

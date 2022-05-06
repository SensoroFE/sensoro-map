import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  useMap,
  MouseTool,
  MarkerCluster,
  InfoWindow,
  Polygon,
} from "@pansy/react-amap";
import type { PolygonProps } from "@pansy/react-amap/es/polygon";
import { Theme, SearchAddress } from "../map";
import DeleteOutlined from "@sensoro-design/icons/DeleteOutlined";
import classNames from "@pansy/classnames";
import { Tools, Marker, ClusterMarker } from "./components";
import type {
  DeviceInfo,
  ServerDeviceInfo,
  OperationType,
  Mode,
  GeoJson,
} from "./interface";
import {
  transformGBServerData,
  transformSenServerData,
  transformPolygonToGeoJson,
  transformGeoJsonToPolygon,
} from "./utils";

const areaStyleMap = {
  // 禁区
  FORBIDDEN_AREA: {
    default: {
      strokeColor: "#FF7575",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#FF4D52",
      fillOpacity: 0.25,
    },
    hover: {
      cursor: "pointer",
      strokeColor: "#FF4D52",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#FF4D52",
      fillOpacity: 0.45,
    },
  },
  FENCING: {
    default: {
      strokeColor: "#82B6FF",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#5591F2",
      fillOpacity: 0.25,
    },
    hover: {
      cursor: "pointer",
      strokeColor: "#82B6FF",
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: "#5591F2",
      fillOpacity: 0.45,
    },
  },
};

const getValue = (value) => {
  // 优先取value
  if (value?.type === "Polygon") {
    return transformGeoJsonToPolygon?.(value);
  } else if (Array?.isArray(value)) {
    return value;
  } else {
    return [];
  }
};

export interface AreaDeviceSelectionProps {
  /**
   * 样式类的前缀
   */
  prefixCls?: string;
  /**
   * 额外的样式类
   */
  className?: string;
  /**
   * 额外的样式
   */
  style?: React.CSSProperties;
  /**
   * 围栏或禁区模式
   */
  mode?: Mode;
  /**
   * 选中的设备集合
   */
  value?: [number, number][] | GeoJson | [];
  /**
   * 指定设备中唯一标识，只针对于灵思设备，请谨慎设置
   * @default `cid`
   */
  deviceKey?: string;
  /**
   * 是否是只读状态
   */
  readonly?: boolean;
  /**
   * 设备集合
   */
  list?: ServerDeviceInfo[] | DeviceInfo[];
  /**
   * 是否需要处理数据
   * 使用场景上层组件已调用utils中的转换数据的方法
   */
  transformData?: boolean;
  /**
   * 设备选择变化的回调
   */
  onChange?: (value: any) => void;
  // 内部使用
  themeStatus?: boolean;
  setThemeStatus?: (status: boolean) => void;
  setDraw: (value: boolean) => void;
  draw: boolean;
  mouseState: {
    state: "stop" | "start" | "drawing";
    position: { x: number; y: number };
  };
  tips: string;
}

export const AreaDeviceSelection: React.FC<AreaDeviceSelectionProps> = ({
  prefixCls,
  readonly = true,
  deviceKey,
  transformData,
  list = [],
  value,
  mode = "FENCING",
  themeStatus,
  setThemeStatus,
  onChange,
  draw,
  setDraw,
  mouseState,
  tips,
}) => {
  const { map } = useMap();
  /** 聚合插件的实例 */
  const cluster = useRef<AMap.MarkerCluster>(null);
  const mapRef = useRef<any>(null);
  const [mouseInfo, setMouseInfo] = useState<{
    drawState?: "start" | "running" | "stop";
    tips?: string;
  }>({
    drawState: "stop",
    tips: "",
  });
  // 所有标记点实例的集合
  const markersInstance = useRef<AMap.Marker[]>([]);
  // 鼠标工具插件实例
  const mouseToolInstance = useRef<AMap.MouseTool>(null);
  // 图形实例
  const mousePolyGonInstance = useRef<AMap.Polygon>(null);
  // 覆盖物实例
  const overLayerInstance = useRef<any>(null);
  // 设备源数据
  const [sourceDevices, setSourceDevices] = useState<DeviceInfo[]>([]);
  // 组件内部维护的选中的坐标点 图形
  const [internalValue, setInternalValue] = useState<[number, number][]>(() => {
    return getValue(value);
  });
  const [visible, setVisible] = useState<number>(0);

  const options = areaStyleMap?.[mode];

  // 空数组和空都是空数据
  const isEmptyData =
    (Array.isArray(internalValue) && internalValue?.length === 0) ||
    !internalValue;

  useEffect(() => {
    setInternalValue(getValue(value));
  }, [value]);

  // infoWindow lnglat
  const position = useMemo(() => {
    if (Array.isArray(internalValue) && internalValue?.length > 0) {
      // 最靠南的坐标
      const [longitude, latitude] = internalValue?.[0];
      let position = {
        longitude,
        latitude,
      };
      internalValue?.forEach?.((i) => {
        const [longitude, latitude] = i;
        if (position?.["latitude"] > latitude) {
          position = { longitude, latitude };
        }
      });
      return position;
    } else {
      return null;
    }
  }, [internalValue]);

  /**
   * 删除覆盖物
   */
  const removeOverLayer = () => {
    if (map && overLayerInstance.current) {
      map.remove([overLayerInstance.current]);
    }
  };

  const setInternalValueCal = useCallback(
    (nextValue: [number, number][] = []) => {
      setInternalValue(nextValue);

      onChange?.(transformPolygonToGeoJson(nextValue));
    },
    [setInternalValue]
  );

  // 动态更新设备点位信息
  useEffect(() => {
    let devices = [];

    if (transformData) {
      devices = [
        ...((list || []) as ServerDeviceInfo[])?.map((item) =>
          transformSenServerData(item, deviceKey)
        ),
      ];
    } else {
      devices = [...list];
    }

    // marker实例 点渲染
    markersInstance.current = devices.map((item) => {
      return new AMap.Marker({
        position: [item.position.longitude, item.position.latitude],
      });
    });

    // 设置 自适应 到地图窗口
    if (map) {
      map.setFitView(markersInstance.current);
    }

    setSourceDevices(
      devices.filter((item) => {
        return item.lnglat && item.lnglat[0] && item.key;
      })
    );
  }, [JSON.stringify(list)]);

  const onMouseover = (e) => {
    setVisible(1);
    overLayerInstance?.current?.setOptions?.(options?.["hover"]);
    mousePolyGonInstance?.current?.setOptions?.(options?.["hover"]);
  };
  const onMouseout = (e) => {
    setTimeout(() => {
      setVisible((o) => (o === 2 ? o : 0));
      overLayerInstance?.current?.setOptions?.(options?.["default"]);
      mousePolyGonInstance?.current?.setOptions?.(options?.["default"]);
    }, 300);
  };
  /**
   * 关闭绘图
   */
  const handleDrawClose = () => {
    const mouseTool = mouseToolInstance.current;
    setDraw(false);
    setMouseInfo((o) => ({ ...o, drawState: "stop" }));
    if (mouseTool) {
      mouseTool.close(true);
    }
  };
  /**
   * 框选结束回调
   * @param data
   */
  const handleDrawEnd = (data: any) => {
    overLayerInstance.current = data;

    const length = data?.getPath()?.map((i) => [i?.lng, i?.lat])?.length || 0;

    if (length >= 3) {
      //  绑定事件
      bindEvent(data);
      // todo 存储 图形区域数据
      setInternalValueCal(data?.getPath()?.map((i) => [i?.lng, i?.lat]));

      handleDrawClose();
    } else {
      // 画直线清除重来
      handleClear();
    }
  };
  const handleClear = () => {
    removeOverLayer();
    setInternalValueCal([]);
  };
  const bindEvent = (instance) => {
    instance?.on?.("mouseover", onMouseover);
    instance?.on?.("mouseout", onMouseout);
  };
  const unBindEvent = (instance) => {
    instance?.off?.("mouseover", onMouseover);
    instance?.off?.("mouseout", onMouseout);
  };

  const renderMarkerCluster = useMemo(() => {
    if (sourceDevices.length == 0) return null;

    return (
      <MarkerCluster
        data={sourceDevices.map((item) => ({ ...item })) as any}
        render={(data: DeviceInfo) => {
          return <Marker info={data} />;
        }}
        renderCluster={({ count, list: clusterData = [] }) => {
          const list = clusterData.filter((item) => item?.selected);

          if (list.length) {
            return (
              <ClusterMarker
                prefixCls={prefixCls}
                badge={list.length}
                count={count}
              />
            );
          }

          return <ClusterMarker prefixCls={prefixCls} count={count} />;
        }}
        events={{
          created: (instance) => {
            cluster.current = instance;
          },
        }}
      />
    );
  }, [JSON.stringify(sourceDevices)]);

  const handleDrawTypeChange = (value: OperationType, options: any = {}) => {
    const mouseTool = mouseToolInstance.current;

    if (!mouseTool || !value) return;
    setDraw(true);
    setMouseInfo((o) => ({ ...o, drawState: "start" }));

    removeOverLayer();

    /**
     * 绘制圆形
     */
    if (value === "circle") {
      mouseTool.circle();
    }
    /**
     * 绘制矩形
     */
    if (value === "rectangle") {
      mouseTool.rectangle();
    }
    /**
     * 绘制多边形
     */
    if (value === "polygon") {
      mouseTool.polygon(options);
    }
  };

  // 鼠标工具
  const toolEvents = {
    created: (tool) => {
      mouseToolInstance.current = tool;
      if (isEmptyData) {
        handleDrawTypeChange?.("polygon", options?.["default"]);
      }
    },
    draw({ type, obj }: any) {
      handleDrawEnd(obj);
    },
  };
  const polyGonEvents = {
    created: (instance) => {
      if (!readonly) {
        mousePolyGonInstance.current = instance;
      }
    },
    mouseover: onMouseover,
    mouseout: onMouseout,
  };
  const showInfoWindow = useMemo(() => {
    return !!visible && !isEmptyData;
  }, [visible, isEmptyData]);

  return (
    <div ref={mapRef}>
      <SearchAddress size="middle" />
      <div className={`${prefixCls}-move-tip`}>{}</div>
      {!readonly && (
        <InfoWindow
          position={position}
          visible={showInfoWindow}
          offset={[40, 0]}
          isCustom
          key="delete"
        >
          <div
            className={`${prefixCls}-info-window`}
            onMouseEnter={() => setVisible(2)}
            onMouseLeave={() => {
              setTimeout(() => {
                setVisible((o) => (o === 1 ? o : 0));
              }, 300);
            }}
            onClick={() => {
              handleClear?.();
              handleDrawTypeChange?.("polygon", options?.["default"]);
              unBindEvent?.(overLayerInstance);
            }}
          >
            <DeleteOutlined className={`${prefixCls}-info-window-icon`} />
            <span className={`${prefixCls}-info-window-text`}>删除区域</span>
          </div>
        </InfoWindow>
      )}
      {draw && mouseState?.position?.x > 0 && mouseState?.position?.y > 0 && (
        <div
          className={`${prefixCls}-info-tips`}
          style={{
            position: "absolute",
            left: mouseState?.position?.x - 8,
            top: mouseState?.position?.y + 12,
          }}
        >
          <span className={`${prefixCls}-info-tips-text`}>{tips}</span>
        </div>
      )}

      {!readonly && <MouseTool events={toolEvents} />}

      <Tools
        showList={sourceDevices?.length ? ["center", "zooms"] : ["zooms"]}
        onGeoClick={() => {
          if (map && markersInstance.current) {
            map.setFitView(markersInstance.current);
          }
        }}
      />

      <Polygon
        events={polyGonEvents}
        path={internalValue}
        visible={!draw}
        style={options?.["default"]}
      />
      {renderMarkerCluster}
    </div>
  );
};
AreaDeviceSelection.defaultProps = {
  readonly: false,
  deviceKey: "cid",
  transformData: true,
};
AreaDeviceSelection.displayName = "SenAreaDeviceSelection";
export default AreaDeviceSelection;

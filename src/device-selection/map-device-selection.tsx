import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { useMap, MouseTool, MarkerCluster } from '@pansy/react-amap';
import {
  Tools,
  Card,
  Marker,
  ReadonlyOperation,
  MainOperation,
  ClusterMarker
} from './components';
import type { DeviceInfo, ServerDeviceInfo, OperationType } from './interface';
import { transformGBServerData, transformSenServerData } from './utils';

export interface MapDeviceSelectionProps {
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
   * 选中的设备集合
   */
  value?: string[];
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
   * 国标设备集合
   */
  listGB?: ServerDeviceInfo[] | DeviceInfo[];
  /**
   * 是否需要处理数据
   * 使用场景上层组件已调用utils中的转换数据的方法
   */
  transformData?: boolean;
  /**
   * 设备选择变化的回调
   */
  onChange?: (value: string[]) => void;
  /**
   * 选择设备点击回调
   */
  onSelectDeviceClick?: () => void;

  // 内部使用
  themeStatus?: boolean;
  setThemeStatus?: (status: boolean) => void;
}

export const MapDeviceSelection: React.FC<MapDeviceSelectionProps> = ({
  prefixCls,
  readonly,
  deviceKey,
  transformData,
  list = [],
  listGB = [],
  value,
  themeStatus,
  setThemeStatus,
  onChange,
  onSelectDeviceClick
}) => {
  const { map } = useMap();
  /** 聚合插件的实例 */
  const cluster = useRef<AMap.MarkerCluster>(null);
  // 所有标记点实例的集合
  const markersInstance = useRef<AMap.Marker[]>([]);
  // 鼠标工具插件实例
  const mouseToolInstance = useRef<AMap.MouseTool>(null);
  // 覆盖物实例
  const overlayerInstance = useRef<any>(null);
  // 是否存在国标设备
  const [isGB, setIsGB] = useState<boolean>(false);
  // 操作类型
  const [operationType, setOperationType] = useState<OperationType>();
  // 设备源数据
  const [sourceDevices, setSourceDevices] = useState<DeviceInfo[]>([]);
  // 组件内部维护的选中的设备
  const [internalValue, setInternalValue] = useState<string[]>([]);

  const setInternalValueCal = useCallback(
    (nextValue: string[] = []) => {
      setInternalValue(nextValue);
      onChange?.(nextValue);
    },
    [setInternalValue]
  );

  useEffect(() => {
    setIsGB(!!listGB?.length);
    setInternalValue([]);
    removeOverlayer();

    let devices = [];

    if (transformData) {
      devices = [
        ...((list || []) as ServerDeviceInfo[])?.map((item) =>
          transformSenServerData(item, deviceKey)
        ),
        ...((listGB || []) as ServerDeviceInfo[])?.map?.(transformGBServerData)
      ];
    } else {
      devices = [...list, ...listGB];
    }

    markersInstance.current = devices.map(item => {
      return new AMap.Marker({
        position: [
          item.position.longitude,
          item.position.latitude,
        ]
      })
    });

    if (map) {
      map.setFitView(markersInstance.current);
    }

    setSourceDevices(
      devices.filter((item) => {
        return item.lnglat && item.lnglat[0] && item.key;
      })
    );
  }, [JSON.stringify(list), JSON.stringify(listGB)]);

  useEffect(() => {
    setInternalValue(Array.isArray(value) ? value : []);
    setSourceDevices((currentList) => {
      return currentList?.map((item) => {
        if (value?.includes(item.key)) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        return item;
      });
    });
  }, [value]);

  const toolEvents = {
    created: (tool) => {
      mouseToolInstance.current = tool;
    },
    draw({ obj }: any) {
      handleDrawEnd(obj);
    }
  };

  /**
   * 框选结束回调
   * @param data
   */
  const handleDrawEnd = (data: any) => {
    overlayerInstance.current = data;
    handleDrawClose();

    // 判断是否框选的标识
    let isSelected = false;

    // 处理设备的选中状态
    const newSourceDevices = sourceDevices.map((item) => {
      let selected = false;
      if (
        // @ts-ignore
        data.contains(new window.AMap.LngLat(item.position.longitude, item.position.latitude))
      ) {
        selected = true;
        isSelected = true;
      }

      if (internalValue.includes(item.key)) {
        selected = true;
      }

      return {
        ...item,
        selected
      };
    });

    setSourceDevices(newSourceDevices);
    setInternalValueCal(newSourceDevices.filter((item) => item.selected).map((item) => item.key));

    if (!isSelected) {
      message.warning('未框选到任何设备');
      setOperationType(undefined);
      removeOverlayer();
    }
  };

  const handleDrawTypeChange = (value: OperationType) => {
    const mouseTool = mouseToolInstance.current;
    setOperationType(value);
    if (!mouseTool || !value) return;

    removeOverlayer();

    /**
     * 绘制圆形
     */
    if (value === 'circle') {
      mouseTool.circle();
    }
    /**
     * 绘制矩形
     */
    if (value === 'rectangle') {
      mouseTool.rectangle();
    }
    /**
     * 绘制多边形
     */
    if (value === 'polygon') {
      mouseTool.polygon();
    }
  };

  /**
   * 关闭绘图
   */
  const handleDrawClose = () => {
    const mouseTool = mouseToolInstance.current;
    if (mouseTool) {
      mouseTool.close();
    }
  };

  const handleReset = () => {
    setSourceDevices(
      sourceDevices.map((item) => {
        return {
          ...item,
          selected: false
        };
      })
    );

    removeOverlayer();
    setInternalValueCal([]);
  };

  const handleRemove = (id: string) => {
    if (!id) return;
    const devices = sourceDevices.map((item) => {
      if (item.key === id) {
        return {
          ...item,
          selected: false
        };
      }

      return item;
    });

    const newSelectDevices = devices.filter((item) => item.selected);

    if (!newSelectDevices.length) {
      removeOverlayer();
    }

    setSourceDevices(devices);
    setInternalValueCal(newSelectDevices.map((item) => item.key));
  };

  /**
   * 删除覆盖物
   */
  const removeOverlayer = () => {
    if (map && overlayerInstance.current) {
      map.remove([overlayerInstance.current]);
      setOperationType(undefined);
    }
  };

  const handleThemeStatusChange = (status: boolean) => {
    setThemeStatus(status);
  };

  const markerCluster = useMemo(
    () => {
      if (sourceDevices.length == 0) return null;

      return (
        <MarkerCluster
          data={sourceDevices.map((item => ({...item})))}
          render={(data: DeviceInfo) => {
            return <Marker info={data} />;
          }}
          renderCluster={({ count, list: clusterData = []  }) => {
            const list = clusterData.filter((item) => item?.selected);

            if (list.length) {
              return (
                <ClusterMarker prefixCls={prefixCls} badge={list.length} count={count} />
              )
            }

            return (
              <ClusterMarker prefixCls={prefixCls} count={count} />
            )
          }}
          events={{
            created: (instance) => {
              cluster.current = instance;
            }
          }}
        />
      )
    },
    [JSON.stringify(sourceDevices)]
  )

  return (
    <>
      {/** 入口操作  */}
      {readonly && (
        <ReadonlyOperation
          themeStatus={themeStatus}
          onThemeStatusChange={handleThemeStatusChange}
          onSelectDeviceClick={onSelectDeviceClick}
        />
      )}

      {/** 主操作  */}
      {!readonly && (
        <MainOperation
          themeStatus={themeStatus}
          operationType={operationType}
          onDrawTypeChange={handleDrawTypeChange as any}
          onThemeStatusChange={handleThemeStatusChange}
        />
      )}

      <Tools
        showList={sourceDevices.length ? ['center', 'zooms'] : ['zooms']}
        onGeoClick={() => {
          if (map && markersInstance.current) {
            map.setFitView(markersInstance.current);
          }
        }}
      />

      {!readonly && (
        <Card
          useGB={isGB}
          devices={sourceDevices.filter((item) => item.selected)}
          onReset={handleReset}
          onRemove={handleRemove}
        />
      )}

      <MouseTool events={toolEvents} />

      {markerCluster}
    </>
  );
};

MapDeviceSelection.defaultProps = {
  readonly: false,
  deviceKey: 'cid',
  transformData: true
};

MapDeviceSelection.displayName = 'SenMapDeviceSelection';

export default MapDeviceSelection;

import React, { useState, useEffect, useContext } from 'react';
import classNames from '@pansy/classnames';
import { MAP_STYLES, imageBase64 } from '../../config';
import Icon from '@sensoro/sensoro-design/es/icon';
import { useMap } from '@pansy/react-amap';
import { ConfigContext } from '../../../components/config-provider';

export interface ThemeProps {
  className?: string;
  style?: React.CSSProperties;
  defaultStatus?: boolean;
  onStatusChange?: (status: boolean) => void;
}

export const Theme: React.FC<ThemeProps> = ({
  className,
  defaultStatus,
  onStatusChange,
  style
}) => {
  const { map } = useMap();
  const [gridStatus, setGridStatus] = useState<boolean>(!!defaultStatus);
  const [sateLite, setSateLite] = useState<any>(null);
  const [markerLayer, setMarkLayer] = useState<any>(null);

  const { getPrefixCls } = useContext(ConfigContext);

  const prefixCls = getPrefixCls('map-theme');

  useEffect(() => {
    try {
      AMap.plugin(['AMap.TileLayer'], () => {
        // @ts-ignore
        const sate = new window.AMap.TileLayer.Satellite();
        // @ts-ignore
        const layer = new window.AMap.TileLayer.Flexible({
          cacheSize: 30,
          opacity: 0.9,
          //@ts-ignore
          createTile: function (x, y, z, success, fail) {
            let img = document.createElement('img');
            img.onload = function () {
              success(img);
            };
            img.crossOrigin = 'anonymous';
            img.onerror = function () {
              fail();
            };
            img.src = imageBase64;
          }
        });
        setMarkLayer(layer);
        setSateLite(sate);
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const handleThemeChange = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (gridStatus) {
      map.setMapStyle(MAP_STYLES.white);
      markerLayer && map.remove([sateLite, markerLayer]);
      setGridStatus(false);
      onStatusChange?.(false);
    } else {
      map.setMapStyle(MAP_STYLES.grid);
      markerLayer && map.add([sateLite, markerLayer]);
      setGridStatus(true);
      onStatusChange?.(true);
    }
  };

  return (
    <span
      onClick={handleThemeChange}
      className={classNames(className, `${prefixCls}-operator`, {
        [`${prefixCls}-operator`]: true,
        [`${prefixCls}-active`]: gridStatus
      })}
      style={style}
    >
      <Icon type="icon-map-theme-grid" />
      实景
    </span>
  );
};

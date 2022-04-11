import React, { useContext, useState } from 'react';
import classNames from '@pansy/classnames';
import { Map } from '../map';
import { ConfigContext } from '../config-provider';
import BaseMapDeviceSelection from './map-device-selection';
import type { MapDeviceSelectionProps } from './map-device-selection';
import './style';

export type { MapDeviceSelectionProps as DeviceSelectionProps };

export const DeviceSelection: React.FC<MapDeviceSelectionProps> = ({
  className,
  style,
  ...rest
}) => {
  /** 地图主题 */
  const [themeStatus, setThemeStatus] = useState<boolean>(false);
  const { getPrefixCls } = useContext(ConfigContext);

  const prefixCls = getPrefixCls('device-selection');

  return (
    <Map
      className={classNames(className, {
        [`${prefixCls}`]: true
      })}
      style={style}
      features={themeStatus ? [] : ['bg', 'point', 'road']}
    >
      <BaseMapDeviceSelection
        {...rest}
        prefixCls={prefixCls}
        themeStatus={themeStatus}
        setThemeStatus={setThemeStatus}
      />
    </Map>
  )
};

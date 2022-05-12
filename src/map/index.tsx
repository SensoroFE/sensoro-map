import React from 'react';
import classNames from '@pansy/classnames';
import {
  Map as BaseMap
} from '@pansy/react-amap';
import { MapProps as BaseMapProps } from '@pansy/react-amap/es/map';
import { Theme } from '../config-provider/types';
import { MAP_CONFIG, MAP_STYLES } from './config';
import './style';

export interface MapProps extends BaseMapProps {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  theme?: Theme;
}

export const Map: React.FC<MapProps> = (props) => {
  const { prefixCls, className, style, children, theme, ...rest } = props;

  return (
    <div
      className={classNames(className, {
        [`${prefixCls}`]: true
      })}
      style={style}
    >
      <BaseMap
        mapKey={MAP_CONFIG.key}
        version={MAP_CONFIG.version}
        mapStyle={MAP_STYLES.white}
        {...rest}
      >
        {children}
      </BaseMap>
    </div>
  );
};

Map.defaultProps = {
  prefixCls: 'sen-map',
}

export { Theme, SearchAddress, CityLocation } from './components';

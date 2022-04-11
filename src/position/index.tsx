import React, { useState, useRef, useEffect, useContext } from 'react';
import classNames from '@pansy/classnames';
import {
  Map,
  SearchAddress,
  Theme
} from '../map';
import { Geocoder, Marker } from '@pansy/react-amap';
import { MapProps } from '@pansy/react-amap/es/map';
import { MarkerProps } from '@pansy/react-amap/es/marker';
import Icon from '@sensoro/sensoro-design/es/icon';
import { ConfigContext } from '../config-provider';
import { Tools } from './components';
import { LngLatArray } from '../map/types';
import './style';

export type PositionValue = {
  lnglat?: LngLatArray;
  location?: string;
};

export interface PositionProps extends MapProps {
  /** 额外的样式类 */
  className?: string;
  /** 额外的样式 */
  style?: React.CSSProperties;
  /**
   * 禁用内部自适应视图
   * @default false
   * */
  disabledFitView?: boolean;
  /** 设备的位置 */
  value?: PositionValue;
  /** 是否只读状态 */
  isReadOnly?: boolean;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 自定义Marker，完全透传 */
  marker?: MarkerProps;
  /** 设备位置改变回调 */
  onChange?: (value: PositionValue) => void;
}

export const Position: React.FC<PositionProps> = ({
  style,
  className,
  value,
  zoom = 16,
  onChange,
  isReadOnly,
  icon,
  marker,
  disabledFitView = false,
  children,
  ...rest
}) => {
  const lock = useRef<boolean>(false);
  const { lnglat = [] } = value || {};
  const [center, setCenter] = useState<LngLatArray>();
  const geocoder = useRef<AMap.Geocoder>();
  const [markerPosition, setMarkerPosition] = useState<LngLatArray>();
  const { getPrefixCls } = useContext(ConfigContext);

  useEffect(() => {
    if (lnglat[0] && lnglat[1]) {
      setMarkerPosition(lnglat as LngLatArray);
    }

    if (!disabledFitView) {
      if (!lock.current && lnglat[0]) {
        setCenter(lnglat as LngLatArray)
      }
    };
  }, [value]);

  const prefixCls = getPrefixCls('position');

  const PositionIcon = icon || <Icon className={`${prefixCls}-marker-icon`} type="icon-position" />;

  const handleMapClick = (lnglat: AMap.LngLat) => {
    if (isReadOnly) return;

    if (geocoder.current) {
      geocoder.current.getAddress(lnglat, (status, result) => {
        let address = '';
        if (status === 'complete' && result.regeocode) {
          address = result.regeocode.formattedAddress;
        }

        const lnglatArr = lnglat.toArray();

        handleChange({
          lnglat: lnglat.toArray(),
          location: address,
        })

        setMarkerPosition(lnglatArr);

        onChange?.({
          lnglat: lnglatArr,
          location: address,
        });
      });
    }
  }

  const handleChange = (data: PositionValue) => {
    lock.current = true;

    setMarkerPosition(data.lnglat);
    onChange?.(data);
  }

  return (
    <Map
      className={classNames(className, {
        [`${prefixCls}`]: true
      })}
      style={style}
      zoom={zoom}
      center={center}
      {...rest}
      events={{
        ...(rest?.events ?? {}),
        click: (e) => {
          const lnglat = e.lnglat;

          if (lnglat) {
            handleMapClick(lnglat);
          }
        }
      }}
    >
      {!isReadOnly && (
        <>
          <SearchAddress />
          <Geocoder
            events={{
              created: (instance) => {
                geocoder.current = instance;
              }
            }}
          />
          <Tools position={value?.lnglat} />
        </>
      )}

      <Theme className={`${prefixCls}-theme`} />

      <Marker
        position={markerPosition}
        render={() => PositionIcon}
        {...marker}
      />

      {children}
    </Map>
  );
};

Position.defaultProps = {
  isReadOnly: false
};

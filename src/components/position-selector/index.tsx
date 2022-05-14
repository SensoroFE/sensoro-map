import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import classNames from "@pansy/classnames";
import { Map, CityLocation } from "../../map";
import { Geocoder, Marker } from "@pansy/react-amap";
import { MapProps } from "@pansy/react-amap/es/map";
import { MarkerProps } from "@pansy/react-amap/es/marker";
import { ConfigContext } from "../config-provider";
import { Tools, SearchAddress, CitySelector } from "./components";
import { LngLatArray } from "../../map/types";
import LocationPurely from "@sensoro-design/icons/LocationPurely";
import PSContextProvider from "./components/context";
import { debounce } from "lodash";
import "./style";

export type PositionValue = {
  lnglat?: AMap.LngLat;
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
  /** 是否展示城市选择器 */
  citySelector?: boolean;
  /** 小尺寸适配  */
  small?: boolean;
}

const PositionSelector: React.FC<PositionProps> = ({
  style,
  className,
  value,
  zoom = 16,
  onChange,
  isReadOnly,
  icon,
  marker,
  disabledFitView = false,
  citySelector = true,
  small=false,
  children,
  ...rest
}) => {
  const lock = useRef<boolean>(false);
  const mapIns = useRef<AMap.Map>();
  const { lnglat = [] } = value || {};
  const [center, setCenter] = useState<LngLatArray>();
  const geocoder = useRef<AMap.Geocoder>();
  const [markerPosition, setMarkerPosition] = useState<AMap.LngLat>();
  const [clickPosition, setClickPosition] = useState<AMap.LngLat>();
  const [city, setCity] = useState<string>("");
  const [tip, setTip] = useState<AMap.AutoComplete.Tip | undefined>(undefined);
  const { getPrefixCls } = useContext(ConfigContext);

  useEffect(() => {
    if (lnglat[0] && lnglat[1]) {
      setMarkerPosition(lnglat as AMap.LngLat);
    }

    if (!disabledFitView) {
      if (!lock.current && lnglat[0]) {
        setCenter(lnglat as LngLatArray);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!tip && clickPosition) setMarkerPosition(clickPosition);
  }, [clickPosition, tip]);

  const prefixCls = getPrefixCls("position");

  const PositionIcon = (
    <span style={{ fontSize: 24 }}>{icon || <LocationPurely />}</span>
  );

  const handleMapClick = (lnglat: AMap.LngLat) => {
    if (isReadOnly) return;

    if (geocoder.current) {
      geocoder.current.getAddress(lnglat, (status, result) => {
        let address = "";

        if (status === "complete" && result.regeocode) {
          address = result.regeocode.formattedAddress;
        }

        const lnglatArr = lnglat.toArray();
        setClickPosition(lnglatArr);
        handleChange({
          lnglat: lnglat.toArray(),
          location: address,
        });
      });
    }
  };

  const handleChange = (data: PositionValue) => {
    lock.current = true;
    !tip && onChange?.(data);
  };

  const SearchAdressDom = useMemo(() => {
    return (
      <SearchAddress
        city={city}
        small={small}
        onChange={(value) => {
          value.lnglat && setMarkerPosition(value.lnglat);
          onChange?.(value);
        }}
      />
    );
  }, [city, small]);

  return (
    <Map
      className={classNames(className, {
        [`${prefixCls}`]: true,
      })}
      style={style}
      zoom={zoom}
      center={center}
      {...rest}
      events={{
        ...(rest?.events ?? {}),
        created: (ins) => {
          mapIns.current = ins;
        },
        click: (e) => {
          const lnglat = e.lnglat;
          if (lnglat) {
            handleMapClick(lnglat);
          }
        },
      }}
    >
      <PSContextProvider tip={tip} setTip={setTip}>
        {!isReadOnly && (
          <>
            {SearchAdressDom}
            <Geocoder
              events={{
                created: (instance) => {
                  geocoder.current = instance;
                },
              }}
            />
            <Tools position={value?.lnglat} small={small} />
            {citySelector && city && (
              <CitySelector small={small} city={city} onChange={setCity} />
            )}
          </>
        )}
        {citySelector && (
          <CityLocation
            onLocation={(c) => {
              setCity(c);
            }}
          />
        )}
      </PSContextProvider>
      <Marker
        position={markerPosition}
        render={() => PositionIcon}
        {...marker}
      />

      {children}
    </Map>
  );
};

PositionSelector.defaultProps = {
  isReadOnly: false,
};

export default PositionSelector;

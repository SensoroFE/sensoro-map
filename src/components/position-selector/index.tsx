import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import classNames from "@pansy/classnames";
import { Map, CityLocation } from "../../map";
import { Geocoder, Marker } from "@pansy/react-amap";
import { MapProps } from "@pansy/react-amap/es/map";
import { MarkerProps } from "@pansy/react-amap/es/marker";
import { ConfigContext } from "../config-provider";
import { Tools, SearchAddress, CitySelector } from "./components";
import { LngLatArray } from "../../map/types";
// @ts-ignore
import LocationPurely from "@sensoro-design/icons/LocationPurely";
import PSContextProvider from "./components/context";
import { fetchCityMsgLnglat } from "../../services/map";
import { debounce, isEqual } from "lodash";
import "./style";

export type PositionValue = {
  lnglat: AMap.LngLat;
  location: string;
  district?: string;
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
  small = false,
  children,
  ...rest
}) => {
  const mapIns = useRef<AMap.Map>();
  const { lnglat = [] } = value || {};
  const [center, setCenter] = useState<LngLatArray>();
  const geocoder = useRef<AMap.Geocoder>();
  const [markerPosition, setMarkerPosition] = useState<AMap.LngLat>();
  const [city, setCity] = useState<string>("");
  const [centerPostion, setCenterPostion] = useState<PositionValue>();
  const [tip, setTip] = useState<AMap.AutoComplete.Tip | undefined>(undefined);
  const [options, setOptions] = useState<any[]>([]);
  const [dropVisible, setDropVisible] = useState<boolean>(!!value?.lnglat);
  const { getPrefixCls } = useContext(ConfigContext);

  useEffect(() => {
    if (centerPostion?.lnglat && isEqual(centerPostion?.lnglat, value?.lnglat))
      return;
    if (lnglat[0] && lnglat[1]) {
      setCenter(lnglat as AMap.LngLat);
      setMarkerPosition(lnglat as AMap.LngLat);
      setTip({
        name: value.location || "",
        location: lnglat,
      } as AMap.AutoComplete.Tip);
      setDropVisible(true);
      /** 自动定位城市 */
      (async () => {
        const c = (await fetchCityMsgLnglat(lnglat)) as string;
        c && typeof c === "string" && setCity(c);
      })();
    }
  }, [value?.lnglat, value?.location]);

  useEffect(() => {
    if (centerPostion?.lnglat && !tip) {
      const p = centerPostion?.lnglat;
      setMarkerPosition(p);
      setTip(undefined);
      setOptions([
        {
          id: Math.random(),
          name: centerPostion.location,
          location: centerPostion.location,
          district: centerPostion?.district || "",
          lng: p[0],
          lat: p[1],
        },
      ]);
      setDropVisible(true);
      (async () => {
        const c = (await fetchCityMsgLnglat(centerPostion.lnglat)) as string;
        c && typeof c === "string" && city !== c && setCity(c);
      })();
      // onChange?.(centerPostion);
    }
  }, [centerPostion, tip]);

  const prefixCls = getPrefixCls("position");

  const PositionIcon = (
    <span style={{ fontSize: 24 }}>{icon || <LocationPurely />}</span>
  );

  const handleMapMoveEnd = () => {
    if (isReadOnly) return;
    const lnglat = mapIns.current?.getCenter?.();
    if (geocoder.current) {
      geocoder.current.getAddress(lnglat, (status, result) => {
        let address = "";
        if (status === "complete" && result.regeocode) {
          const regeocode = result.regeocode;
          address = regeocode.formattedAddress;
          const { city, province, district } = regeocode?.addressComponent || {};
          let dis = `${province}${Array.isArray(city) ? "" : city}${district}`;
          setCenterPostion({
            lnglat: lnglat.toArray() as any,
            location: address,
            district: dis
          });
        }
      });
    }
  };

  const SearchAdressDom = useMemo(() => {
    return (
      <SearchAddress
        city={city}
        small={small}
        onChange={(v) => {
          v.lnglat && setMarkerPosition(v.lnglat);
          onChange?.(v);
        }}
      />
    );
  }, [city, small, dropVisible]);

  return (
    <Map
      className={classNames(className, {
        [`${prefixCls}`]: true,
      })}
      center={center}
      style={style}
      zoom={zoom}
      {...rest}
      events={{
        ...(rest?.events ?? {}),
        created: (ins) => {
          mapIns.current = ins;
        },
        moveend: handleMapMoveEnd,
      }}
    >
      <PSContextProvider
        tip={tip}
        setTip={setTip}
        dropVisible={dropVisible}
        setDropVisible={setDropVisible}
        centerPostion={centerPostion}
        setCenterPostion={setCenterPostion}
        options={options}
        setOptions={setOptions}
      >
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
            {citySelector && city && (
              <CitySelector small={small} city={city} onChange={setCity} />
            )}
            {!value?.lnglat && citySelector && (
              <CityLocation
                onLocation={(c) => {
                  setCity(c);
                }}
                resetView={!!value?.lnglat}
              />
            )}
          </>
        )}
        <Tools small={small} />
      </PSContextProvider>
      {!tip && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -100%)",
          }}
        >
          {PositionIcon}
        </div>
      )}
      {tip && (
        <Marker
          position={markerPosition}
          render={() => PositionIcon}
          {...marker}
        />
      )}

      {children}
    </Map>
  );
};

PositionSelector.defaultProps = {
  isReadOnly: false,
};

export default PositionSelector;

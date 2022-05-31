import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import classNames from "@pansy/classnames";
import { Map, CityLocation } from "../../map";
import { Marker } from "@pansy/react-amap";
import { MapProps } from "@pansy/react-amap/es/map";
import { MarkerProps } from "@pansy/react-amap/es/marker";
import { ConfigContext } from "../config-provider";
import { Tools, SearchAddress, CitySelector } from "./components";
import { LngLatArray } from "../../map/types";
import { POI_TYPE } from "../../common/constants";
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
  const [map, setMap] = useState<AMap.Map | null>(null);
  const searchIns = useRef<AMap.PlaceSearch>();
  const { lnglat = [] } = value || {};
  const [center, setCenter] = useState<LngLatArray>();
  const [markerPosition, setMarkerPosition] = useState<AMap.LngLat>();
  const [city, setCity] = useState<string>("");
  const [tip, setTip] = useState<AMap.AutoComplete.Tip | undefined>(undefined);
  const [options, setOptions] = useState<any[]>([]);
  const [searchList, setSearchList] = useState<any[]>([]);
  const [dropVisible, setDropVisible] = useState<boolean>(!!value?.lnglat);
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls("position-selector");

  useEffect(() => {
    if (!map || searchIns.current) return;
    try {
      map?.plugin(["AMap.PlaceSearch"], () => {
        const placeSearch = new AMap.PlaceSearch({
          city: "全国",
          type: POI_TYPE,
          //@ts-ignore
          citylimit: true,
          pageSize: 20, // 单页显示结果条数
          pageIndex: 1, // 页码
        });
        searchIns.current = placeSearch;
      });
    } catch (e) {
      console.log("初始化地图Plugin-PlaceSearch失败======>", e);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;
    map.on("moveend", handleMapMoveEnd);
    return () => {
      map?.off?.("moveend", handleMapMoveEnd);
    };
  }, [map, tip])

  useEffect(() => {
    if (lnglat[0] && lnglat[1] && !tip) {
      // @ts-ignore
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
  }, [value?.lnglat, value?.location, tip]);

  useEffect(() => {
    searchIns?.current && searchIns.current.setCity(city || "全国");
  }, [city]);


  const handleMapMoveEnd = () => {
    if (isReadOnly) return;
    const lnglat = map?.getCenter?.();
    lnglat && handleSearchPoi([lnglat.lng, lnglat.lat]);
  };

  const PositionIcon = (
    <span style={{ fontSize: 24, lineHeight: '24px'}}>{icon || <LocationPurely />}</span>
  );

  const handleSearchPoi = debounce((center) => {
    if (!searchIns?.current || tip) return;
    //@ts-ignore
    searchIns.current.searchNearBy("", center, 500, (status, result) => {
      if (status === "complete" && result?.info?.toLowerCase() === "ok") {
        const list = result?.poiList?.pois || [];
        const formatedList = list.map((i: any, idx: number) => {
          return {
            id: idx,
            name: i.name,
            location: i.location,
            district: i?.address || "",
            lng: i?.location?.lng,
            lat: i?.location?.lat,
          };
        });
        setOptions(formatedList);
        setTip(undefined);
        setDropVisible(true);
      }
    });
  }, 500);

  const SearchAdressDom = useMemo(() => {
    return (
      <SearchAddress
        city={city}
        small={small}
        onChange={(v) => {
          console.log(v);
          v?.lnglat && setMarkerPosition(v.lnglat);
          onChange?.(v);
        }}
      />
    );
  }, [city, small, options, dropVisible, tip]);

  return (
    <Map
      className={classNames(className, {
        [`${prefixCls}`]: true,
      })}
      center={center}
      style={style}
      zoom={zoom}
      dragEnable={!tip}
      {...rest}
      events={{
        ...(rest?.events ?? {}),
        created: (ins) => {
          setMap(ins);
        },
      }}
    >
      <PSContextProvider
        tip={tip}
        setTip={setTip}
        dropVisible={dropVisible}
        setDropVisible={setDropVisible}
        options={options}
        setOptions={setOptions}
      >
        {!isReadOnly && (
          <>
            {SearchAdressDom}
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
            fontSize: 24, 
            lineHeight: "24px",
            transform: "translate(-50%, -50%)",
          }}
        >
          {PositionIcon}
        </div>
      )}
      {tip && (
        <Marker
          position={markerPosition}
          render={() => PositionIcon}
          offset={[0, 15]}
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

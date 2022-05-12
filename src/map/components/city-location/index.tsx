import React, { FC, useEffect, memo } from "react";
import { useMap } from "@pansy/react-amap";

interface CityLocationProps {
  onChange?: (city: string, code: string) => void;
  resetView?: boolean; // 是否需要重置地图视野范围
}

const CityLocation: FC<CityLocationProps> = (props) => {
  const { onChange, resetView = true } = props;
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      map.plugin("AMap.CitySearch", function () {
        //@ts-ignore
        const citySearch = new AMap.CitySearch();
        citySearch.getLocalCity((status, res) => {
          if (status === "complete" && res.info === "OK") {
            if (res && res.city && res.bounds) {
              const { city, adcode, bounds } = res;
              //地图显示当前城市
              resetView && map.setBounds(bounds);
              onChange?.(city, adcode);
            }
          }
        });
      });
    } catch (e) {
      console.info(`浏览器定位城市失败 ======>`, JSON.stringify(e));
    }
  }, [map, resetView]);

  return null;
};

export default memo(CityLocation);

import React, { FC, useEffect, memo } from "react";
import { useMap } from "@pansy/react-amap";

interface DivisionData {
  label: string;
  value: string;
  children: DivisionData[];
}

interface IChinaDivision {
  onDataLoad?: (division: DivisionData[]) => void;
}

const provinceReplace = /(特别行政区|维吾尔自治区|回族自治区|藏族自治区|壮族自治区|自治区|省|市)$/;
const cityRepleact = /(市|城区)$/;

const ChinaDivision: FC<IChinaDivision> = (props) => {
  const { onDataLoad } = props;
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      map.plugin("AMap.DistrictSearch", function () {
        //@ts-ignore
        const districtSearch = new AMap.DistrictSearch({
          level: "country",
          showbiz: false, // 是否显示商圈
          subdistrict: 2,
        });
        districtSearch.search("中国", function (status, result) {
          if (status == "complete") {
            const province = result.districtList?.[0]?.districtList || [];
            const parsedData = province
              .sort((pre, cur) => pre.adcode - cur.adcode)
              .map((i) => {
                return {
                  label: i.name.replace(provinceReplace, ""),
                  value: i.adcode,
                  children: (i.districtList || [])
                    .sort((pre, cur) => pre.adcode - cur.adcode)
                    ?.map((city) => {
                      return {
                        label: city.name.replace(cityRepleact, ""),
                        value: city.adcode,
                        citycode: city.citycode,
                        lnglat: [city?.center?.lng, city?.center?.lat]
                      };
                    }),
                };
              });

            onDataLoad?.(parsedData);
          }
        });
      });
    } catch (e) {
      console.info(`获取中国省市区数据失败 ======>`, JSON.stringify(e));
    }
  }, [map]);

  return null;
};

export default memo(ChinaDivision);

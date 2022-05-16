import { MAP_KEYS } from "../common/constants";

/**
 * 高德逆地理编码查询
 * @param keywords
 * @returns
 */
export const fetchCityMsgLnglat = (lnglat: any) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=${MAP_KEYS}&location=${lnglat.join(
        ","
      )}`,
      {
        method: "get",
      }
    )
      .then((data) => data.json())
      .then((res = {}) => {
        const { regeocode, info } = res;
        if (info?.toLowerCase() === "ok" && regeocode) {
          const city = regeocode?.addressComponent?.city;
          resolve(
            typeof city === "string"
              ? city
              : regeocode?.addressComponent?.province || ""
          );
        }
      })
      .catch((error) => {
        console.info("======>逆地理编码查询坐标位置信息失败", error);
      });
  });
};

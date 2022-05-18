import React, { FC, useState, useEffect, useRef } from "react";
import { Input, Button } from "antd";
import { AutoCompleteProps } from "@pansy/react-amap/es/auto-complete/types";
import { PositionValue } from "../../";
import { useMap, AutoComplete } from "@pansy/react-amap";
import { usePSContext } from "../context";
import { debounce } from "lodash";
import classNames from "@pansy/classnames";

// 中英文、数字、空格、英文·、英文.、英文_，不能以空格开头
// eslint-disable-next-line
const nameRegexp = new RegExp(
  "^[-,，。.、a-zA-Z\\u4E00-\\u9FA5\\d\\.\\_\\·][-,，.。、a-zA-Z()+=\\u4E00-\\u9FA5\\d\\s\\.\\_\\·]*$"
);

export interface SearchAddressProps extends AutoCompleteProps {
  prefixCls?: string;
  /** 设备位置改变回调 */
  onChange?: (value: PositionValue) => void;
  city?: string; // 设置限定城市
  small?: boolean; //
}

const SearchAddress: FC<SearchAddressProps> = (props) => {
  const autoComplete = useRef<AMap.AutoComplete>();
  const clickRef = useRef();
  const { map } = useMap();
  const { prefixCls, onChange, small = false, city } = props;
  const [searchVal, setSearchVal] = useState<string | undefined>(undefined);
  const [loca, setLoca] = useState<undefined | string>(undefined);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    tip,
    setTip,
    dropVisible,
    setDropVisible,
    setCenterPostion,
    options,
    setOptions,
  } = usePSContext();

  const handleMapEvents = () => {
    !tip && setDropVisible(false);
  };

  useEffect(() => {
    autoComplete?.current?.setCity(city || "全国");
    autoComplete?.current?.setCityLimit(!!city);
    setOptions([]);
  }, [city]);

  useEffect(() => {
    if (!tip && city) setDropVisible(false);
  }, [city, tip]);

  useEffect(() => {
    if (!searchVal && !tip) setDropVisible(false);
  }, [searchVal, tip]);

  useEffect(
    debounce(() => {
      setErrorMsg("");
      if (tip?.location) {
        if (!loca) {
          setErrorMsg("名称不能为空");
          return;
        } else if (loca.length > 50) {
          setErrorMsg("名称不能超过50个字");
          return;
        } else if (!nameRegexp.test(loca)) {
          setErrorMsg("名称包含异常字符");
          return;
        }
        const tipLoca = tip?.location;
        const point = Array.isArray(tipLoca)
          ? tipLoca
          : [tip?.location?.lng || tip?.lng, tip?.location?.lat || tip?.lat];
        onChange?.({
          lnglat: point as any,
          location: loca,
        });
      } else {
        setErrorMsg("");
      }
    }, 200),
    [loca, tip]
  );

  useEffect(() => {
    setErrorMsg("");
    if (tip) {
      tip.name && setLoca(tip.name);
    }
    map.on("click", handleMapEvents);
    return () => {
      map.off("click", handleMapEvents);
    };
  }, [tip]);

  const handleSelect = (item: AMap.AutoComplete.Tip) => {
    setErrorMsg("");
    const locat = item.location;
    if (!locat) return;
    setTip(item);
    const position = [locat.lng, locat.lat];
    map?.setCenter(position as any);
  };

  const handleSearch = (value: string) => {
    if (!autoComplete.current || !value.trim()) return;
    autoComplete.current.search(value, (status, results) => {
      if (status === "complete") {
        const tips = results.tips.filter((item) => item.id);
        setOptions(tips.filter((i) => i.location));
        setDropVisible(true);
      } else {
        setOptions([]);
        setDropVisible(true);
      }
    });
  };

  const renderItem = (item: AMap.AutoComplete.Tip) => {
    return (
      <div
        key={item.id}
        className={`${prefixCls}-dropdown-item`}
        onClick={() => {
          handleSelect(item);
        }}
      >
        <p>{item.name}</p>
        <p>{item.district || ""}</p>
      </div>
    );
  };

  const empty = (
    <p
      className={classNames(`${prefixCls}-empty`, {
        [`${prefixCls}-empty-small`]: !!small,
      })}
    >
      暂无结果，请移动地图选择位置
    </p>
  );

  return (
    <div
      className={classNames(prefixCls, {
        [`${prefixCls}-small`]: !!small,
      })}
      ref={clickRef}
    >
      <AutoComplete
        events={
          {
            created: (obj) => {
              autoComplete.current = obj;
            },
          } as any
        }
      />
      <Input.Search
        onSearch={handleSearch}
        onFocus={() => {
          options.length && setDropVisible(true);
        }}
        onChange={(e) => {
          const val = e.target.value;
          setTip(undefined);
          setSearchVal(val);
          handleSearch(val);
        }}
        disabled={!!tip}
        value={searchVal}
        style={{ width: small ? 200 : 240 }}
        size={small ? "small" : "middle"}
        allowClear
        placeholder="请输入地址信息"
      />
      {dropVisible && !tip && (
        <div
          className={classNames(`${prefixCls}-dropdown`, {
            [`${prefixCls}-dropdown-small`]: !!small,
          })}
        >
          {options.length ? <>{options.map((i) => renderItem(i))}</> : empty}
        </div>
      )}
      {dropVisible && tip && (
        <div
          className={classNames(
            `${prefixCls}-dropdown`,
            `${prefixCls}-dropdown-tip`,
            {
              [`${prefixCls}-dropdown-small`]: !!small,
            }
          )}
        >
          <Input
            value={loca}
            onChange={(e) => {
              setLoca(e.target.value);
            }}
            size="small"
            style={{ width: small ? 176 : 216 }}
            className={classNames({
              ["input-error"]: !!errorMsg,
            })}
          />
          {errorMsg ? (
            <p className="sen-error">{errorMsg}</p>
          ) : (
            <p className="sen-tip">可编辑地址名称</p>
          )}
          <p className="sen-district">{tip.district}</p>
          <div
            className="sen-btn"
            onClick={() => {
              setTip(undefined);
              setCenterPostion(undefined);
              onChange?.(undefined);
            }}
          >
            重置
          </div>
        </div>
      )}
    </div>
  );
};

SearchAddress.defaultProps = {
  prefixCls: "sen-map-position-selector-search-address",
};

export default SearchAddress;

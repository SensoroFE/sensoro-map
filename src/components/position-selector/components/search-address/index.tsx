import React, { FC, useState, useEffect, useRef } from "react";
import { uniqueId } from "lodash";
import { Input, AutoComplete as AntAutoComplete } from "antd";
import { AutoCompleteProps } from "@pansy/react-amap/es/auto-complete/types";
import { LngLatObj } from "../../../../map/types";
import { useMap, AutoComplete } from "@pansy/react-amap";
import { useClickAway } from "ahooks";

export interface SearchAddressProps extends AutoCompleteProps {
  prefixCls?: string;
  onChange?: (position: LngLatObj) => void;
  city?: string; // 设置限定城市
  size?: "middle" | "small";
}

const SearchAddress: FC<SearchAddressProps> = (props) => {
  const autoComplete = useRef<AMap.AutoComplete>();
  const clickRef = useRef();
  const { map } = useMap();
  const { prefixCls, onChange, size, city } = props;
  const [searchVal, setSearchVal] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState([]);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    autoComplete?.current?.setCity(city || "全国");
    autoComplete?.current?.setCityLimit(!!city);
  }, [city]);

  useClickAway(() => {
    setVisible(false);
  }, clickRef);

  useEffect(() => {
    if(!searchVal) setVisible(false);
  }, [searchVal]);

  const handleSelect = (value: string, options: any) => {
    const location = options.location;
    if (!location) return;
    map?.setCenter([location.lng, location.lat]);
    map?.setZoom(15);
    onChange?.({
      longitude: location.lng,
      latitude: location.lat,
    });
  };

  const handleSearch = (value: string) => {
    if (!autoComplete.current || !value.trim()) return;
    autoComplete.current.search(value, (status, results) => {
      if (status === "complete") {
        const tips = results.tips.filter((item) => item.id);
        console.log("tips", tips);
        setOptions(tips);
        setVisible(true);
      } else {
        setOptions([]);
        setVisible(true);
      }
    });
  };

  const renderItem = (item: AMap.AutoComplete.Tip) => {
    return (
      <div key={item.id} className={`${prefixCls}-dropdown-item`}>
        <p>{item.name}</p>
        <p>{item.district}</p>
      </div>
    );
  };

  const empty = <p className={`${prefixCls}-empty`}>无搜索结果</p>;

  return (
    <div className={prefixCls} ref={clickRef}>
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
        onChange={(e) => {
          const val = e.target.value;
          setSearchVal(val);
          handleSearch(val);
        }}
        value={searchVal}
        style={{ width: size === "small" ? 200 : 240 }}
        size={size}
        allowClear
        placeholder="请输入地址信息"
      />
      {visible && (
        <div className={`${prefixCls}-dropdown`}>
          {options.length ? <>{options.map((i) => renderItem(i))}</> : empty}
        </div>
      )}
    </div>
  );
};

SearchAddress.defaultProps = {
  prefixCls: "sen-map-position-selector-search-address",
  size: "middle",
};

export default SearchAddress;

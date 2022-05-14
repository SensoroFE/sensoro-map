import React, { FC, useState, useEffect, useRef } from "react";
import { ChinaDivision } from "../../../../map";
import { Input } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import classNames from "@pansy/classnames";
import { useMap } from "@pansy/react-amap";
import { usePSContext } from "../context";
import { useClickAway } from "ahooks";

interface DivisionData {
  label: string;
  value: string;
  lnglat?: [number, number];
  children: DivisionData[];
}

export interface CitySelectorProps {
  prefixCls?: string;
  onChange?: (city: string) => void;
  city?: string; // 设置限定城市
  small?: boolean;
}

const CitySelector: FC<CitySelectorProps> = (props) => {
  const { map } = useMap();
  const { prefixCls, city, small = false, onChange } = props;
  // 点击热区之外内容区, 收起城市选择器
  const hotRef = useRef(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [citys, setCitys] = useState<DivisionData[]>([]);
  const [source, setSource] = useState<DivisionData[]>([]);
  const [curCity, setCurCity] = useState<string>("");

  const { tip } = usePSContext();

  useEffect(() => {
    city && setCurCity(city);
  }, [city]);

  useEffect(() => {
    source?.length && setCitys(source);
  }, [source]);

  useClickAway(() => {
    setVisible(false);
  }, hotRef);

  const handleSearch = (val: string) => {
    const search = val.trim();
    if (!search) {
      setCitys(source);
      return;
    }
    let fitledCity = source.filter((i) => {
      const cs = i.children.map((i) => i.label);
      return cs.some((i) => i?.includes(val));
    });
    if (fitledCity.length) {
      fitledCity.forEach((i) => {
        let child = i.children;
        i.children = child.filter((c) => c.label.includes(val));
      });
      setCitys(fitledCity);
    } else {
      setCitys(source);
    }
  };

  const handleClickCity = (c: string, position: any) => {
    setCurCity(c);
    onChange?.(c);
    setVisible(false);
    position && map?.setZoomAndCenter(15, position);
  };

  return (
    <div
      className={classNames(prefixCls, {
        [`${prefixCls}-small`]: !!small,
      })}
      ref={hotRef}
    >
      <ChinaDivision
        onDataLoad={(division) => {
          setSource(division);
        }}
      />
      <div
        className={classNames(`${prefixCls}-content`, {
          [`${prefixCls}-content-small`]: !!small,
          [`${prefixCls}-content-visible`]: visible,
          [`${prefixCls}-content-disabled`]: !!tip,
        })}
        onClick={() => {
          !tip && setVisible(!visible);
        }}
      >
        {curCity}
        <CaretDownOutlined />
      </div>
      {visible && (
        <div className={`${prefixCls}-dropdown`}>
          <div className={`${prefixCls}-dropdown-title`}>
            <div>
              当前城市
              <p>{curCity}</p>
            </div>
            <div>
              <Input.Search
                style={{
                  width: 120,
                }}
                onSearch={handleSearch}
                size="small"
                placeholder="请输入城市"
              />
            </div>
          </div>
          <div>
            {citys.map((i) => (
              <div key={i.value} className={`${prefixCls}-dropdown-province`}>
                <p>{i.label}</p>
                <div>
                  {i.children.map((c) => (
                    <span
                      onClick={() => {
                        handleClickCity(c.label, c?.lnglat);
                      }}
                      key={c.value}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CitySelector.defaultProps = {
  prefixCls: "sen-map-position-selector-city-selector",
};

export default CitySelector;

import React, { FC, useState, useEffect, useRef } from "react";
import { ChinaDivision } from "../../../../map";
import { CaretDownOutlined } from "@ant-design/icons";
import classNames from "@pansy/classnames";
import { LngLatObj } from "../../../../map/types";
import { useMap } from "@pansy/react-amap";
import { useClickAway } from "ahooks";

interface DivisionData {
  label: string;
  value: string;
  children: DivisionData[];
}

export interface CitySelectorProps {
  prefixCls?: string;
  onChange?: (position: LngLatObj) => void;
  city?: string; // 设置限定城市
  size?: "middle" | "small";
}

const CitySelector: FC<CitySelectorProps> = (props) => {
  const { map } = useMap();
  const { prefixCls, city } = props;
  // 点击热区之外内容区, 收起城市选择器
  const hotRef = useRef(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [citys, setCitys] = useState<DivisionData[]>([]);
  const [curCity, setCurCity] = useState<string>("");

  useEffect(() => {
    city && setCurCity(city);
  }, [city]);

  useClickAway(() => {
    setVisible(false);
  }, hotRef);

  return (
    <div className={prefixCls}>
      <ChinaDivision
        onDataLoad={(division) => {
          setCitys(division);
        }}
      />
      <div
        className={classNames(`${prefixCls}-content`, {
          [`${prefixCls}-content-visible`]: visible,
        })}
        ref={hotRef}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        {curCity}
        <CaretDownOutlined />
      </div>
      {visible && <div></div>}
    </div>
  );
};

CitySelector.defaultProps = {
  prefixCls: "sen-map-position-selector-city-selector",
  size: "middle",
};

export default CitySelector;

import React, { useState, useRef } from 'react';
import { uniqueId } from 'lodash';
import { Input, AutoComplete as AntAutoComplete } from 'antd';
import { AutoCompleteProps } from '@pansy/react-amap/es/auto-complete/types';
import { LngLatObj } from '../../types';
import { useMap, AutoComplete } from '@pansy/react-amap';


export interface SearchAddressProps extends AutoCompleteProps {
  prefixCls?: string;
  onChange?: (position: LngLatObj) => void;
}

export const SearchAddress: React.FC<SearchAddressProps> = (props) => {
  const autoComplete = useRef<AMap.AutoComplete>();
  const { map } = useMap();
  const { prefixCls, onChange } = props;
  const [options, setOptions] = useState([]);

  const handleSelect = (value: string, options: any) => {
    const location = options.location;
    if (!location) return;
    map?.setCenter([location.lng, location.lat]);
    map?.setZoom(15);
    onChange?.({
      longitude: location.lng,
      latitude: location.lat
    });
  };

  const handleSearch = (value: string) => {
    if (!autoComplete.current) return;
    autoComplete.current.search(value, (status, results) => {
      if (status === 'complete') {
        const tips = results.tips.filter((item) => item.id).map(renderItem);

        setOptions(tips);
      }
    });
  };

  const renderItem = (item: AMap.AutoComplete.Tip) => {
    return {
      ...item,
      value: item.name,
      key: uniqueId('address_'),
      label: (
        <div>
          {item.name}
          <span style={{ paddingLeft: 4, color: 'rgba(0, 0, 0, 0.45)' }}>{item.district}</span>
        </div>
      )
    };
  };

  return (
    <span className={prefixCls}>
      <AutoComplete
        events={{
          created: (obj) => {
            autoComplete.current = obj;
          }
        } as any}
      />
      <AntAutoComplete
        onSelect={handleSelect}
        onSearch={handleSearch}
        style={{ width: 224 }}
        options={options}
      >
        <Input.Search size="small" placeholder="请输入地址" />
      </AntAutoComplete>
    </span>
  );
};

SearchAddress.defaultProps = {
  prefixCls: 'sen-map-search-address'
};

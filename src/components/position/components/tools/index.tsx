import React, { FC } from 'react';
import classNames from '@pansy/classnames';
import { useMap } from '@pansy/react-amap';
import PlusOutlined from '@sensoro-design/icons/PlusOutlined';
import MinusOutlined from '@sensoro-design/icons/MinusOutlined';
import Icon from '@sensoro/sensoro-design/es/icon';
import { LngLatArray } from '../../../../map/types';

interface ToolsProps {
  prefixCLs?: string;
  position?: LngLatArray;
}

export const Tools: FC<ToolsProps> = ({ prefixCLs, position }) => {
  const { map } = useMap();

  const handlePlusClick = () => {
    map?.zoomIn();
  };

  const handleMinusClick = () => {
    map?.zoomOut();
  };

  const handleGeoClick = () => {
    if (position?.[0]) {
      map?.setCenter(position);
    }
  };

  return (
    <div className={prefixCLs}>
      <div className={classNames(`${prefixCLs}-geo`, `${prefixCLs}-item`)} onClick={handleGeoClick}>
        <Icon type="icon-aim" />
      </div>
      <div className={`${prefixCLs}-zooms`}>
        <div className={`${prefixCLs}-item`} onClick={handlePlusClick}>
          <PlusOutlined />
        </div>
        <div className={`${prefixCLs}-item`} onClick={handleMinusClick}>
          <MinusOutlined />
        </div>
      </div>
    </div>
  );
};

Tools.defaultProps = {
  prefixCLs: 'sen-map-position-tools'
};

export default Tools;

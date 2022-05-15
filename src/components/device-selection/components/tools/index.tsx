import React, { useContext } from 'react';
import classNames from '@pansy/classnames';
import PlusOutlined from '@sensoro-design/icons/PlusOutlined';
import MinusOutlined from '@sensoro-design/icons/MinusOutlined';
import Icon from '@sensoro/sensoro-design/es/icon';
import { useMap } from '@pansy/react-amap';
import { ConfigContext } from '../../../config-provider';

export interface ToolsProps {
  showList?: ('zooms' | 'center')[];
  onGeoClick?: () => void;
}

export const Tools: React.FC<ToolsProps> = ({
  showList = [],
  onGeoClick
}) => {
  const { getPrefixCls } = useContext(ConfigContext);
  const { map } = useMap();

  const prefixCls = getPrefixCls('device-selection-tools');

  const handlePlusClick = () => {
    map?.zoomIn();
  };

  const handleMinusClick = () => {
    map?.zoomOut();
  };

  return (
    <div className={prefixCls}>
      {showList.includes('center') && (
        <div className={classNames(`${prefixCls}-geo`, `${prefixCls}-item`)} onClick={onGeoClick}>
          <Icon type="icon-aim" />
        </div>
      )}
      {showList.includes('center') && (
        <div className={`${prefixCls}-zooms`}>
          <div className={`${prefixCls}-item`} onClick={handlePlusClick}>
            <PlusOutlined />
          </div>
          <div className={`${prefixCls}-item`} onClick={handleMinusClick}>
            <MinusOutlined />
          </div>
        </div>
      )}
    </div>
  );
};

Tools.defaultProps = {
  showList: ['center', 'zooms']
};

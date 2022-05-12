import React, { useContext } from 'react';
import classNames from '@pansy/classnames';
import { PlusOutlined } from '@ant-design/icons';
import { Theme } from '../../../../map';
import { ConfigContext } from '../../../config-provider';

interface ReadonlyOperationProps {
  themeStatus?: boolean;
  onSelectDeviceClick?: () => void;
  onThemeStatusChange?: (status: boolean) => void;
}

export const ReadonlyOperation: React.FC<ReadonlyOperationProps> = ({
  themeStatus,
  onSelectDeviceClick,
  onThemeStatusChange
}) => {
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('device-selection-operation');

  return (
    <div className={classNames(`${prefixCls}`, `${prefixCls}-mini`)}>
      <Theme
        defaultStatus={themeStatus}
        className={classNames(`${prefixCls}-item`, {
          [`${prefixCls}-active`]: themeStatus
        })}
        onStatusChange={onThemeStatusChange}
      />
      <span className={`${prefixCls}-item`} onClick={onSelectDeviceClick}>
        <PlusOutlined />
        选择设备
      </span>
    </div>
  );
};

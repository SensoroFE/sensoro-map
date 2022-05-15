import React, { useContext } from 'react';
import CheckOutlined from '@sensoro-design/icons/CheckOutlined';
import classNames from '@pansy/classnames';
import Icon from '@sensoro/sensoro-design/es/icon';
import { DeviceInfo } from '../../interface';
import { ConfigContext } from '../../../config-provider';

export interface MarkerProps {
  info: DeviceInfo;
  onClick?: (info: DeviceInfo) => void;
}

export const Marker: React.FC<MarkerProps> = ({ info }) => {
  const { getPrefixCls } = useContext(ConfigContext);

  const prefixCls = getPrefixCls('device-selection-marker');

  return (
    <div
      className={classNames(prefixCls, {
        [`${prefixCls}-offline`]: info.status !== 1
      })}
    >
      <Icon type={info?.titleIcon?.type || 'icon-camera'} />

      {info.selected && (
        <div className={`${prefixCls}-selected`}>
          <CheckOutlined />
        </div>
      )}
    </div>
  );
};

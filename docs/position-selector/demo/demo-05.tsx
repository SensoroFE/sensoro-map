import React from 'react';
import Icon from '@sensoro/sensoro-design/es/icon';
import { PositionSelector } from '@sensoro/sensoro-map';

export default () => {
  return (
    <PositionSelector
      style={{ width: 550, height: 300 }}
      value={{ lnglat: [116.905163, 40.006047], location: '这个是一个位置' }}
      icon={<Icon type="icon-car-outlined" style={{ fontSize: 24, color: 'red' }} />}
    />
  );
};

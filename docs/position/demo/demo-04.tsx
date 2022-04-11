import React from 'react';
import Icon from '@sensoro/sensoro-design/es/icon';
import { Position } from '@sensoro/sensoro-map';

export default () => {
  return (
    <Position
      style={{ width: 550, height: 300 }}
      value={{ lnglat: [116.905163, 40.006047], location: '' }}
      icon={<Icon type="icon-car-outlined" style={{ fontSize: 24, color: 'red' }} />}
    />
  );
};

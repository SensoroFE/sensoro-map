import React from 'react';
import { Position } from '@sensoro/sensoro-map';

export default () => {
  return (
    <Position
      style={{ width: 550, height: 300 }}
      value={{ lnglat: [116.905163, 40.006047], location: '' }}
      isReadOnly
    />
  );
};

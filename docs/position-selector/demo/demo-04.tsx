import React from 'react';
import { PositionSelector } from '@sensoro/sensoro-map';

export default () => {
  return (
    <PositionSelector
      style={{ width: 550, height: 300 }}
      value={{ lnglat: [116.378517, 39.865246], location: '' }}
      isReadOnly
    />
  );
};

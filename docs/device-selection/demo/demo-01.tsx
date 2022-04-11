import React from 'react';
import { DeviceSelection } from '@sensoro/sensoro-map';
import { devices } from './data-source';

export default () => {
  return (
    <DeviceSelection
      style={{ height: 500 }}
      deviceKey="sn"
      list={devices}
      onChange={(value) => {
        console.log(value);
      }}
    />
  );
};

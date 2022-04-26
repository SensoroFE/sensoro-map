import React from 'react';
import { DeviceSelection } from '@sensoro/sensoro-map';
import { devices, GBDevices } from './data-source';

export default () => {
  return <DeviceSelection style={{ height: 500 }} list={devices} listGB={GBDevices} />;
};

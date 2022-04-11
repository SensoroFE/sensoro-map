import React from 'react';
import { DeviceSelection } from '@sensoro/sensoro-map';
import { devices } from './data-source';

export default () => {
  return <DeviceSelection readonly style={{ width: 550, height: 300 }} list={devices} />;
};

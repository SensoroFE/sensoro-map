import React from 'react';
import { Map } from '@sensoro/sensoro-map';
import { RangingTool } from '@pansy/react-amap';

export default () => {
  return (
    <Map style={{ height: 500 }}>
      <RangingTool />
    </Map>
  );
};

import React from 'react';
import Icon from '@sensoro/sensoro-design/es/icon';
import { MapType } from '@pansy/react-amap';
import { Position } from '@sensoro/sensoro-map';

export default () => {
  return (
    <Position
      style={{ width: 550, height: 300 }}
      center={[116.905163, 40.006047]}
      zoom={15}
      disabledFitView
    >
      <MapType />
    </Position>
  );
};

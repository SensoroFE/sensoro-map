import React from 'react';

export interface ClusterMarkerProps {
  prefixCls?: string;
  badge?: number;
  count?: number;
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = ({
  prefixCls,
  badge,
  count
}) => {
  if (badge) {
    return (
      <div className={`${prefixCls}-markers`}>
        <span className="ant-badge ant-badge-not-a-wrapper">
          <sup className="ant-badge-count">{badge}</sup>
        </span>
        {count}
      </div>
    )
  }

  return (
    <div className={`${prefixCls}-markers`}>
      {count}
    </div>
  )
}

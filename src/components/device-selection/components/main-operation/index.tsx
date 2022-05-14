import React, { useContext } from 'react';
import classNames from '@pansy/classnames';
import { Theme } from '../../../../map';
import Icon from '@sensoro/sensoro-design/es/icon';
import { ConfigContext } from '../../../config-provider';

const operations = [
  { type: 'circle', label: '圆形', icon: 'icon-round-selection' },
  { type: 'rectangle', label: '矩形', icon: 'icon-square-selection' },
  { type: 'polygon', label: '多边形', icon: 'icon-polygon-selected' }
];

export interface MainOperationProps {
  themeStatus?: boolean;
  operationType?: string;
  onThemeStatusChange?: (status: boolean) => void;
  onDrawTypeChange?: (status: string) => void;
}

export const MainOperation: React.FC<MainOperationProps> = ({
  themeStatus,
  operationType,
  onDrawTypeChange,
  onThemeStatusChange
}) => {
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('device-selection-operation');

  return (
    <div className={classNames(`${prefixCls}`)}>
      <Theme
        defaultStatus={themeStatus}
        style={{ marginRight: 8 }}
        className={classNames(`${prefixCls}-item`, {
          [`${prefixCls}-active`]: themeStatus
        })}
        onStatusChange={onThemeStatusChange}
      />

      {operations.map((item) => (
        <span
          key={item.type}
          className={classNames(`${prefixCls}-item`, {
            [`${prefixCls}-active`]: operationType === item.type
          })}
          onClick={() => {
            onDrawTypeChange?.(item.type);
          }}
        >
          <Icon type={item.icon} />
          {item.label}
        </span>
      ))}
    </div>
  );
};

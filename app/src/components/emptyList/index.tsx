import React from 'react';
import { InboxOutlined } from '@ant-design/icons';

/**
 * Component to show empty label
 * @props title
 */
const EmptyList: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'rgba(0, 0, 0, 0.25)', fontSize: '12pt' }}>
      <InboxOutlined style={{ fontSize: 26 }} />
      <label>{title}</label>
    </div>
  );
};

export default EmptyList;

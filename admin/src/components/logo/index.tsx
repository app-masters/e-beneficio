import React from 'react';
import { env } from '../../env';
import { Image, Wrapper } from './styles';
import { Typography } from 'antd';

const consumptionType = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';
const adminTitle = env.ADMIN_TITLE;

/**
 * Simple logo component that changes according to the consumption type
 */
export const Logo = ({ width, showTitle = true }: { width?: number; showTitle?: boolean }) => {
  return (
    <Wrapper width={width}>
      <Image src={`/${consumptionType}/logo.png`} alt={`${consumptionType} logo`} />
      {showTitle && <Typography.Title>{adminTitle}</Typography.Title>}
    </Wrapper>
  );
};

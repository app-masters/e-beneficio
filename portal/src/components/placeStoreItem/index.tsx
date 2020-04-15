import React from 'react';
import { PlaceStore } from '../../interfaces/placeStore';
import { Card, Typography } from 'antd';
import { ItemContainer, CardStyle, CardTitleStyle, CardSubTitleStyle } from './styles';

const { Text } = Typography;

/**
 * Place search component
 * @param props component props
 */
export const PlaceStoreItem: React.FC<PlaceStore> = (props) => {
  return (
    <Card bodyStyle={CardStyle}>
      <ItemContainer>
        <Text style={CardTitleStyle}>{props.place.title}</Text>
        <Text style={CardSubTitleStyle}>{props.title}</Text>
        <Text style={CardSubTitleStyle}>{props.address}</Text>
      </ItemContainer>
    </Card>
  );
};

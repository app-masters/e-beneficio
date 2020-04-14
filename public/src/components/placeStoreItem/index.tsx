import React from 'react';
import { PlaceStore } from '../../interfaces/placeStore';
import { Card } from 'antd';
import { ItemContainer } from './styles';

const { Meta } = Card;

/**
 * Place search component
 * @param props component props
 */
export const PlaceStoreItem: React.FC<PlaceStore> = (props) => {
  return (
    <Card>
      <ItemContainer>
        <Meta title={props.place.title} />
        <Meta title={props.title} description={props.address} />
      </ItemContainer>
    </Card>
  );
};

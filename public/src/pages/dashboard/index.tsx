import React, { useState, useEffect } from 'react';
import { PageHeader, Button, Col, Row, Input, Form } from 'antd';
import {
  PageContainer,
  HeaderContainer,
  ActionContainer,
  InputStyle,
  EstablishmentContainer,
  InfoContainer
} from './styles';
import { PlaceStoreItem } from '../../components/placeStoreItem';
import { PlaceStore } from '../../interfaces/placeStore';
import { requestGetPlaceStore } from '../../redux/placeStore/actions';
import { Place } from '../../interfaces/place';
import { useDispatch } from 'react-redux';

const cardData = Array.from(Array(5)).map((item, index) => {
  const obj: PlaceStore = {
    cityId: index,
    placeId: index,
    title: 'Unidade Centro ' + index,
    address: 'Address Store ' + index,
    cnpj: 'CNPJ Store ' + index,
    place: {
      cityId: index,
      title: 'Rede de Supermercados Silva ' + index
    } as Place
  };
  return obj;
});

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
  const dispatch = useDispatch();
  const [listOfPlacesStore, setPlacesStore] = useState([]);

  useEffect(() => {
    const cityId = process.env.REACT_APP_ENV_CITY_ID;
    // dispatch(requestGetPlaceStore(cityId));
    const result = cardData as any;
    setPlacesStore(result);
  }, []);

  return (
    <PageContainer>
      <HeaderContainer>
        <PageHeader title="Consulta" />
        <Form layout="vertical">
          <Form.Item>
            <Input.Search style={InputStyle} loading={false} enterButton maxLength={11} />
          </Form.Item>
        </Form>
        <ActionContainer>
          <Button href={'#establishment'}>Estabelecimentos</Button>
          <Button href={'#info'}>Saiba mais</Button>
        </ActionContainer>
      </HeaderContainer>

      <EstablishmentContainer id="establishment">
        <PageHeader title="Estabelecimentos" subTitle="Lugares onde é possível consumir os créditos disponíveis." />
        <Row gutter={[8, 8]}>
          {listOfPlacesStore.map((item, index) => (
            <Col key={index} xs={24} sm={24} md={8} lg={8} xl={8}>
              <PlaceStoreItem {...item} />
            </Col>
          ))}
        </Row>
      </EstablishmentContainer>

      <InfoContainer id="info">
        <PageHeader title="Informações de uso" />
        <label>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </label>
      </InfoContainer>
    </PageContainer>
  );
};

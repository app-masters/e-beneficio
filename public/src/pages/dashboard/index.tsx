import React from 'react';
import { PageHeader, Card, Button, Col, Row, Input, Form } from 'antd';
import {
  PageContainer,
  HeaderContainer,
  ActionContainer,
  InputStyle,
  EstablishmentContainer,
  InfoContainer
} from './styles';

const cardData = [
  { id: 1, name: 'Bahamas Teste 1', address: 'Rua de Teste para Teste 1' },
  { id: 2, name: 'Bahamas Teste 2', address: 'Rua de Teste para Teste 2' },
  { id: 3, name: 'Bahamas Teste 3', address: 'Rua de Teste para Teste 3' },
  { id: 4, name: 'Bahamas Teste 4', address: 'Rua de Teste para Teste 4' },
  { id: 5, name: 'Bahamas Teste 5', address: 'Rua de Teste para Teste 5' }
];

const { Meta } = Card;

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
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
        <PageHeader title="Estabelecimentos" />
        <Row gutter={[8, 8]}>
          {cardData.map((item) => (
            <Col key={item.id} xs={24} sm={24} md={8} lg={8} xl={8}>
              <Card>
                <Meta title={item.name} description={item.address} />
              </Card>
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

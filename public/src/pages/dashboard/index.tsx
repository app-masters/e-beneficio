import React, { useEffect } from 'react';
import { Typography, Spin, Layout, Collapse, List, Button, Col, Row } from 'antd';
import {
  PageContainer,
  HeaderContainer,
  PanelActionContainer,
  BodyContainer,
  HeaderContent,
  PanelStyle,
  Container
} from './styles';
import { PlaceStoreItem } from '../../components/placeStoreItem';
import { PlaceStore } from '../../interfaces/placeStore';
import { requestGetPlaceStore } from '../../redux/placeStore/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { FamilySearch } from '../../components/familySearch';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { Footer } = Layout;

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
  const dispatch = useDispatch();

  const cityId = process.env.REACT_APP_ENV_CITY_ID as string;

  const placeStoreLoading = useSelector<AppState, boolean>((state) => state.placeStoreReducer.loading);
  const placeStore = useSelector<AppState, [PlaceStore] | null | undefined>((state) => state.placeStoreReducer.item);

  useEffect(() => {
    dispatch(requestGetPlaceStore(cityId));
  }, [cityId, dispatch]);

  return (
    <PageContainer>
      <Layout style={{ backgroundColor: '#F9F9F9' }}>
        <HeaderContainer>
          <HeaderContent>
            <Title level={3} style={{ color: '#FFFFFF' }}>
              Recursos para vulneráveis
            </Title>
            <Text style={{ color: '#FFFFFF' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
            </Text>
          </HeaderContent>
        </HeaderContainer>

        <Container>
          <BodyContainer id="saldo">
            <Title level={4}>Consultar seu saldo</Title>
            <FamilySearch />
          </BodyContainer>
          <BodyContainer id="info">
            <Title level={4}>Informações de uso</Title>
            <Collapse bordered={false} style={PanelStyle}>
              <Panel header="Tenho direito ao benefício?" key="1">
                {text}
                <List
                  itemLayout="horizontal"
                  dataSource={[1, 2, 3, 4, 5]}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta title={'item.title' + index} />
                    </List.Item>
                  )}
                />
              </Panel>
              <Panel header="Obter mais informações." key="2">
                {text}
                <PanelActionContainer>
                  <Button type="link" href="https://www.pjf.mg.gov.br/jfcontracoronavirus/index.php">
                    Saiba mais
                  </Button>
                </PanelActionContainer>
              </Panel>
            </Collapse>
          </BodyContainer>
          <BodyContainer id="establishment">
            <Title level={4}>Estabelecimentos</Title>
            <Paragraph>Lugares onde é possível consumir os créditos disponíveis.</Paragraph>
            <Spin spinning={placeStoreLoading}>
              {placeStore && (
                <Row gutter={[8, 8]}>
                  {placeStore.map((item, index) => (
                    <Col key={index} xs={24} sm={24} md={8} lg={8} xl={8}>
                      <PlaceStoreItem {...item} />
                    </Col>
                  ))}
                </Row>
              )}
            </Spin>
          </BodyContainer>
        </Container>

        <Footer>Footer</Footer>
      </Layout>
    </PageContainer>
  );
};

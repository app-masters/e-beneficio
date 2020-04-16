import React, { useEffect } from 'react';
import { Typography, Spin, Layout, Collapse, Button, Col, Row, Card } from 'antd';
import {
  PageContainer,
  HeaderContainer,
  PanelActionContainer,
  BodyContainer,
  HeaderContent,
  PanelStyle,
  Container,
  LogoContainer
} from './styles';
import { PlaceStoreItem } from '../../components/placeStoreItem';
import { PlaceStore } from '../../interfaces/placeStore';
import { requestGetPlaceStore } from '../../redux/placeStore/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { FamilySearch } from '../../components/familySearch';
import { Flex } from '../../components/flex';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { Footer } = Layout;

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = () => {
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
            <LogoContainer>
              <img src={require('../../assets/logo.png')} alt="" />
            </LogoContainer>
            <Title level={2} style={{ color: '#FFFFFF', marginBottom: 0 }}>
              Mercado Popular
            </Title>
            <Title level={4} style={{ color: '#FFFFFF' }}>
              Suporte para famílias em situação de vulnerabilidade
            </Title>
          </HeaderContent>
        </HeaderContainer>
        <Container>
          <BodyContainer id="about">
            <Card size="small">
              <Paragraph>
                O programa Mercardo Popular oferece suporte para famílias em situação de vulnerabilidade, permitindo
                comprar produtos nos estabelecimentos parceiros utilizando apenas o saldo do programa.
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                Para saber se você tem direito, escreva o código NIS do responsável familiar e veja seu saldo
                disponível.
              </Paragraph>
            </Card>
          </BodyContainer>
        </Container>
        <Container>
          <BodyContainer id="saldo">
            <Title level={4}>Consultar saldo no programa</Title>
            <FamilySearch />
          </BodyContainer>
        </Container>
        {/* <Flex style={{ backgroundColor: '#FFF' }} justifyContent="center"> */}
        <Container>
          <BodyContainer id="info">
            <Title level={4}>Informações sobre o programa</Title>
            <Card size="small">
              <Collapse bordered={false} style={PanelStyle}>
                <Panel header="O que é o programa?" key="what">
                  <Text>
                    O programa Mercado Popular oferece suporte para famílias em situação de vulnerabilidade enfrentando
                    a crise causada pela pandemia do Coronavírus.
                    <br />
                    Você pode utilizar o saldo disponível nos estabelecimentos parceiros fazendo compras dos produtos da
                    cesta básica de maneira gratúita.
                  </Text>
                </Panel>
                <Panel header="Tenho direito ao benefício?" key="who">
                  <Text>
                    Tem direito ao benefício quem está cadastrado e possúir o código NIS do responsável familiar.
                    Famílias na seguinte situação estão cadastradas no sistema:
                  </Text>
                  <Typography>
                    <ul>
                      <li>Residentes de {process.env.REACT_APP_ENV_CITY_NAME}</li>
                      <li>No perfil de extrema pobreza, linha da pobreza ou cadastradas no CAD único</li>
                    </ul>
                  </Typography>
                </Panel>
                <Panel header="Obter mais informações" key="info">
                  <Text>
                    Para obter mais informações, ligue para {process.env.REACT_APP_ENV_INFO_PHONE} ou entre no seguinte
                    link e estaremos prontos para te ajudar
                  </Text>
                  <PanelActionContainer>
                    <Button href={process.env.REACT_APP_ENV_INFO_LINK} target="_blank">
                      Saiba mais
                    </Button>
                  </PanelActionContainer>
                </Panel>
              </Collapse>
            </Card>
          </BodyContainer>
        </Container>
        {/* </Flex> */}
        <Container>
          <BodyContainer id="estabelecimentos">
            <Title level={4}>Estabelecimentos parceiros</Title>
            <Paragraph>Esses são os locais onde você pode usar seus créditos no programa</Paragraph>
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
        <Footer>
          <Flex vertical justifyContent="center" alignItems="center">
            <Paragraph style={{ textAlign: 'center' }}>
              Esse projeto é open-source e você pode contribuir com ele indo no repositório no{' '}
              <a href="https://github.com/TiagoGouvea/resources4vulnerable">GitHub</a>
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', fontSize: '12px' }}>
              Feito pela <a href="https://appmasters.io/pt">App Masters</a> para a{' '}
              <a href="https://www.pjf.mg.gov.br/">Prefeitura de Juiz de Fora</a>
            </Paragraph>
          </Flex>
        </Footer>
      </Layout>
    </PageContainer>
  );
};

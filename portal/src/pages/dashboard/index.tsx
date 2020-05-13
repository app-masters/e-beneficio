import React, { useState } from 'react';
import { Typography, Layout, Collapse, Button, Card } from 'antd';
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
import { FamilySearch } from '../../components/familySearch';
import { Flex } from '../../components/flex';
import { env } from '../../env';
import { ConsumptionForm } from './form';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { Footer } = Layout;

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = () => {
  const [modal, setModal] = useState(false);
  return (
    <PageContainer>
      <Layout style={{ backgroundColor: '#F9F9F9' }}>
        <HeaderContainer>
          <HeaderContent>
            <LogoContainer>
              <img src={require('../../assets/logo.png')} alt="" />
            </LogoContainer>
            <Title level={2} style={{ color: '#FFFFFF', marginBottom: 0 }}>
              e-Benefício
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
        <Container>
          <BodyContainer id="consumo">
            <Title level={4}>Adicionar consumo</Title>
            <div>
              <Button onClick={() => setModal(!modal)}>Adicionar</Button>
              <ConsumptionForm open={modal} closeModal={() => setModal(false)} />
            </div>
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
                    O programa e-Benefício oferece suporte para famílias em situação de vulnerabilidade com dependentes
                    matriculados na rede municipal de ensino enfrentando a crise causada pela pandemia do Coronavírus.
                    <br />
                    Faça a busca pelo NIS do responsável familiar e saiba se você tem direito ao benefício e onde buscar
                    o seu cartão.
                  </Text>
                </Panel>
                <Panel header="Tenho direito ao benefício?" key="who">
                  <Text>
                    Tem direito ao benefício quem está cadastrado e possuir o código NIS do responsável familiar. Estão
                    cadastradas famílias atendidas pelo Bolsa Família com dependentes matriculados na rede municipal de
                    ensino.
                  </Text>
                  {/* <Typography>
                    <ul>
                      <li>Residentes de {env.REACT_APP_ENV_CITY_NAME}</li>
                      <li>No perfil de extrema pobreza, linha da pobreza ou cadastradas no CAD único</li>
                    </ul>
                  </Typography> */}
                </Panel>
                <Panel header="Tenho direito mas não estou na lista" key="direito">
                  <Text>
                    Caso acredite que tem o direito ao benefício, mas não encontrou seu NIS na busca, faça seu cadastro
                    com a prefeitura.
                  </Text>
                  <PanelActionContainer>
                    <Button href={env.REACT_APP_ENV_FORM_URL} target="_blank">
                      Fazer cadastro
                    </Button>
                  </PanelActionContainer>
                </Panel>
                <Panel header="Obter mais informações" key="info">
                  <Text>
                    Para obter mais informações, ligue para {env.REACT_APP_ENV_INFO_PHONE} ou entre no seguinte link e
                    estaremos prontos para te ajudar
                  </Text>
                  <PanelActionContainer>
                    <Button href={env.REACT_APP_ENV_INFO_LINK} target="_blank">
                      Saiba mais
                    </Button>
                  </PanelActionContainer>
                </Panel>
              </Collapse>
            </Card>
          </BodyContainer>
        </Container>
        {/* </Flex> */}
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

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
        {/* <Flex style={{ backgroundColor: '#FFF' }} justifyContent="center"> */}
        <Container>
          <BodyContainer id="info">
            <Title level={4}>Informações sobre o programa</Title>
            <Card size="small">
              <Collapse bordered={false} style={PanelStyle}>
                <Panel header="O que é o programa?" key="what">
                  <Typography.Paragraph>
                    O programa e-Benefício oferece suporte para famílias em situação de vulnerabilidade com dependentes
                    matriculados na rede municipal de ensino enfrentando a crise causada pela pandemia do Coronavírus.
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    Faça a busca pelo NIS do responsável familiar e saiba se você tem direito ao benefício e onde buscar
                    o seu cartão.
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    Após utilizar seu cartão, você pode soliciar a recarga do valor gasto se apenas foram comprados os
                    itens permitidos.
                    <PanelActionContainer>
                      <Button href={'#compra'}>Informar compra</Button>
                    </PanelActionContainer>
                  </Typography.Paragraph>
                </Panel>
                <Panel header="Tenho direito ao benefício?" key="who">
                  <Text>
                    Tem direito ao benefício quem está cadastrado e possuir o código NIS do responsável familiar. Estão
                    cadastradas famílias atendidas pelo Bolsa Família com dependentes matriculados na rede municipal de
                    ensino.
                  </Text>
                </Panel>
                <Panel header="Acho que tenho direito mas não estou na lista" key="direito">
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
                <Panel header="Não tenho um NIS" key="who">
                  <Text>
                    O NIS é o Número de Identificação Social, pode ser encontrado no seu cartão do programa Bolsa
                    Família ou seu Cartão do Cidadão.
                  </Text>
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
        <Container>
          <BodyContainer id="compra">
            <Title level={4}>Recarda do valor das compras</Title>
            <Card>
              <Paragraph style={{ marginBottom: 0 }}>
                Se você fez uma compra utilizando o cartão, você pode informar ela aqui para ser avaliada e receber a
                recarga do valor gasto no próximo mês. Para fazer isso você vai precisar das informações do responsável
                familiar e do comprovante da compra.
              </Paragraph>
              <PanelActionContainer>
                <Button type="primary" onClick={() => setModal(!modal)}>
                  Informar compra
                </Button>
                <ConsumptionForm open={modal} closeModal={() => setModal(false)} />
              </PanelActionContainer>
            </Card>
          </BodyContainer>
        </Container>
        <Footer>
          <Flex vertical justifyContent="center" alignItems="center">
            <Paragraph style={{ textAlign: 'center' }}>
              Esse projeto é open-source e você pode contribuir com ele indo no repositório no{' '}
              <a href="https://github.com/app-masters/e-beneficio">GitHub</a>
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

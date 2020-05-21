import React, { useState } from 'react';
import { Typography, Layout, Collapse, Button, Card, Col } from 'antd';
import {
  PageContainer,
  HeaderContainer,
  PanelActionContainer,
  BodyContainer,
  HeaderContent,
  PanelStyle,
  Container,
  LogoContainer,
  ActionContainer
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
              Programa para famílias em situação de vulnerabilidade social
            </Title>
            <ActionContainer justify="center" gutter={[16, 16]}>
              <Col xs={{ span: 24 }} lg={{ span: 6 }}>
                <Button block href={'#saldo'} type={'primary'}>
                  Consultar saldo
                </Button>
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 6 }}>
                <Button block href={'#compra'} type={'primary'}>
                  Informar compra
                </Button>
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 6 }}>
                <Button block href={'#info'} type={'primary'}>
                  Informações sobre o programa
                </Button>
              </Col>
            </ActionContainer>
          </HeaderContent>
        </HeaderContainer>
        <Container>
          <BodyContainer id="about">
            <Card size="small">
              <Paragraph>
                O programa e-Beneficio oferece suporte para famílias em situação de vulnerabilidade social que estejam
                inseridas no Programa Bolsa Família e que possuam dependentes regularmente matriculados na rede de
                educação. O e-Beneficio possibilita que as famílias que atendam os requisitos, recebam um cartão em nome
                do responsável familiar, que por sua vez poderá ser utilizado na rede credenciada de acordo com o saldo
                disponível no cartão.
              </Paragraph>
            </Card>
          </BodyContainer>
        </Container>
        <Container>
          <BodyContainer id="saldo">
            <Title level={4}>Ver situação no programa</Title>
            {!modal && <FamilySearch />}
          </BodyContainer>
        </Container>
        <Container>
          <BodyContainer id="info">
            <Title level={4}>Informações sobre o programa</Title>
            <Card size="small">
              <Collapse bordered={false} style={PanelStyle}>
                <Panel header="O que é o programa?" key="what">
                  <Paragraph>
                    O programa e-Beneficio oferece suporte às famílias em situação de vulnerabilidade social que estejam
                    ativas no programa de transferência de renda Bolsa Família e possuam dependentes regularmente
                    matriculados na rede municipal de educação no município de Juiz de Fora.
                  </Paragraph>
                  <Paragraph>
                    Faça a busca pelo NIS do responsável familiar e saiba se você tem direito ao benefício e onde buscar
                    o seu cartão.
                  </Paragraph>
                  <Paragraph>
                    Após utilizar seu cartão, você pode soliciar a recarga do valor gasto se apenas foram comprados os
                    itens permitidos.
                    <PanelActionContainer>
                      <Button href={'#compra'}>Informar compra</Button>
                    </PanelActionContainer>
                  </Paragraph>
                </Panel>
                <Panel header="Tenho direito ao benefício?" key="who">
                  <Paragraph>
                    O cadastro no programa e-Benefício foi feito de maneira automática a partir das informações dos
                    beneficiários do Programa Bolsa Família e de alunos inscritos na rede municipal de ensino.
                  </Paragraph>
                  <Text>Para saber se você está incluído, faça a busca pelo NIS do responsável familiar.</Text>
                  <PanelActionContainer>
                    <Button href={'#saldo'}>Consultar saldo pelo NIS</Button>
                  </PanelActionContainer>
                </Panel>
                <Panel header="Acho que tenho direito mas não estou na lista" key="list">
                  <Paragraph>
                    Caso acredite que tem o direito ao benefício, mas não encontrou o NIS do responsável familiar na
                    busca, verifique se sua família atende aos requisitos do programa:
                  </Paragraph>
                  <Paragraph>
                    <ul>
                      <li>Você é beneficiário do Programa Bolsa Família?</li>
                      <li>Você possui dependentes matriculados na rede municipal de educação?</li>
                    </ul>
                  </Paragraph>
                  <Text>
                    Se você atende os requisitos, faça o cadastro utilizando o formulário da Prefeitura logo abaixo e
                    sua situação será avaliada.
                  </Text>
                  <PanelActionContainer>
                    <Button href={env.REACT_APP_ENV_FORM_URL} target="_blank">
                      Fazer cadastro
                    </Button>
                  </PanelActionContainer>
                </Panel>
                <Panel header="Não tenho ou não sei o meu NIS" key="dont have">
                  <Paragraph>
                    O NIS é o Número de Identificação Social, pode ser encontrado no cartão do programa Bolsa Família do
                    responsável familiar. A inscrição no programa é requisito para fazer parte do e-Benefício.
                  </Paragraph>
                  <Text>
                    Se você faz parte do programa, mas não lembra seu NIS, você pode encontrar ele utilizando o portal
                    do <b>Meu CadÚnico</b>.
                  </Text>
                  <PanelActionContainer>
                    <Button href={'https://meucadunico.cidadania.gov.br/meu_cadunico/'} target="_blank">
                      Encontrar NIS
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
        <Container>
          <BodyContainer id="compra">
            <Title level={4}>Recarga do valor das compras</Title>
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
                {modal && <ConsumptionForm closeModal={() => setModal(false)} />}
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

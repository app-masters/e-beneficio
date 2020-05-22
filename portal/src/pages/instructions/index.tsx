import React from 'react';
import { Typography, Layout, Card, Col, Row } from 'antd';
import {
  PageContainer,
  HeaderContainer,
  BodyContainer,
  HeaderContent,
  Container,
  LogoContainer,
  FooterImageContainer,
  FooterImageWrapper,
  ImageContainer
} from './styles';
import { Flex } from '../../components/flex';
// import { env } from '../../env';
import { GithubOutlined } from '@ant-design/icons';

import ticketCard from '../../assets/help/cartao_alimentacao.jpg';
import imageStep01 from '../../assets/help/help_step2_01.jpg';
import imageStep02 from '../../assets/help/help_step2_02.jpg';
import imageStep03 from '../../assets/help/help_step2_03.jpg';
import imageStep04 from '../../assets/help/help_step2_04.jpg';
import imageStep05 from '../../assets/help/help_step2_07.jpg';

// const { Panel } = Collapse;
const { Title, Paragraph } = Typography;
const { Footer } = Layout;

/**
 * Instructions page component
 * @param props component props
 */
export const InstructionsPage: React.FC<{}> = () => {
  return (
    <PageContainer>
      <Layout style={{ backgroundColor: '#F9F9F9' }}>
        <HeaderContainer>
          <HeaderContent>
            <LogoContainer>
              <img src={require('../../assets/logo.png')} alt="" />
            </LogoContainer>
            <Title level={1} style={{ color: '#FFFFFF', marginBottom: 0 }}>
              e-Benefício
            </Title>
            <Title level={2} style={{ color: '#FFFFFF', fontSize: '16pt' }}>
              Programa da Prefeitura de Juiz de Fora para garantir alimentação para famílias em situação de
              vulnerabilidade social
            </Title>
          </HeaderContent>
        </HeaderContainer>

        <Container>
          <BodyContainer id="help">
            <Title level={2}>Passo a passo na utilização do Cartão Vale Alimentação</Title>
            <Card size="small">
              <Title level={4}>Passo 1 de X</Title>
              <Paragraph>
                <strong>Ao receber o cartão você receberá uma senha.</strong> Na primeira utilização o cartão já
                desbloqueia. <strong>IMPORTANTE: não passe o cartão nem a senha para ninguém.</strong>
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '90%', alignSelf: 'center' }} src={ticketCard} alt="Cartão ticket alimentação" />
              </ImageContainer>

              <Title level={4}>Passo 2 de X</Title>
              <Paragraph>
                Quando for ao mercado, antes de passar as compras na esteira e o cartão na máquina, peça ao Caixa para
                colocar o número do seu CPF na nota fiscal para que você consiga prestar contas e não tenha o cartão
                bloqueado e o benefício suspenso.
              </Paragraph>

              <Paragraph>
                Entre no site na parte <a href="/#compra">INFORMAR COMPRA</a> (Inclusão de Consumo – Informações
                Iniciais) e digite o código do <strong>NIS da Referência Familiar</strong> e o aniversário do
                responsável – não se esqueça de sempre apertar a tecla azul para <strong>confirmar a compra</strong>.
              </Paragraph>

              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep01} alt="Inserir SIS do responsável" />
              </ImageContainer>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep02} alt="Confirmar data de anivesário do responsável" />
              </ImageContainer>

              <Title level={4}>Passo 3 de X</Title>
              <Paragraph>
                Confira se seus dados estão <strong>corretos</strong>. Não se esqueça de confirmar!
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep03} alt="Confira seus dados" />
              </ImageContainer>

              <Title level={4}>Passo 4 de X</Title>
              <Paragraph>
                Pegue a sua <strong>Nota fiscal</strong> do mercado onde fez as compras. Tire uma foto desse
                quadradinho. Ele se chama <strong>QR-Code</strong>. Aperte confirmar.
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep04} alt="Confira seus dados" />
              </ImageContainer>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep05} alt="Confira seus dados" />
              </ImageContainer>
            </Card>
          </BodyContainer>
        </Container>

        <Footer>
          <Flex vertical justifyContent="center" alignItems="center">
            <Paragraph style={{ textAlign: 'center' }}>
              Esse projeto é open-source. Visite-nos no
              <a
                href="https://github.com/app-masters/e-beneficio"
                style={{ color: '#00000090', fontWeight: 'bolder', marginLeft: 5 }}
              >
                <GithubOutlined style={{ fontSize: 16, marginRight: 3 }} />
                {'GitHub'}
              </a>
            </Paragraph>
            <FooterImageWrapper>
              <Row style={{ flex: 1, justifyContent: 'space-around' }}>
                <Col>
                  <Paragraph style={{ textAlign: 'center', fontSize: 12 }}>Desenvolvido pela</Paragraph>
                  <FooterImageContainer>
                    <a href="https://appmasters.io/pt">
                      <img
                        src={require('../../assets/AppMastersLogo.png')}
                        alt="AppMastersLogo"
                        width={'100%'}
                        style={{ maxWidth: 180 }}
                      />
                    </a>
                  </FooterImageContainer>
                </Col>
                <Col>
                  <Paragraph style={{ textAlign: 'center', fontSize: 12 }}>Em parceria com</Paragraph>
                  <FooterImageContainer>
                    <a href="https://www.pjf.mg.gov.br/">
                      <img
                        src={require('../../assets/PrefJuizForaLogo.png')}
                        alt="PJFLogo"
                        width={'100%'}
                        style={{ maxWidth: 180 }}
                      />
                    </a>
                  </FooterImageContainer>
                </Col>
              </Row>
            </FooterImageWrapper>
          </Flex>
        </Footer>
      </Layout>
    </PageContainer>
  );
};

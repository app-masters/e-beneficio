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

import qrCodeImage from '../../assets/qrCodeImage.png';
import ticketCard from '../../assets/help/cartao_alimentacao.jpg';
import imageStep00 from '../../assets/help/help_step2_00.jpg';
import imageStep01 from '../../assets/help/help_step2_01.jpg';
import imageStep02 from '../../assets/help/help_step2_02.jpg';
import imageStep03 from '../../assets/help/help_step2_03.jpg';
import imageStep04 from '../../assets/help/help_step2_04.jpg';
import imageStep05 from '../../assets/help/help_step2_07.jpg';
import imageStep06 from '../../assets/help/help_step2_06.jpg';
import imageStep07 from '../../assets/help/help_step2_08.jpg';

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
              <Title level={4}>Passo 1 de 7</Title>
              <Paragraph>
                <strong>Ao receber o cartão você receberá uma senha.</strong> Na primeira utilização o cartão já
                desbloqueia. <strong>IMPORTANTE: não passe o cartão nem a senha para ninguém.</strong>
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '90%', alignSelf: 'center' }} src={ticketCard} alt="Cartão ticket alimentação" />
              </ImageContainer>

              <Title level={4}>Passo 2 de 7</Title>
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
                <img style={{ width: '130%' }} src={imageStep00} alt="Página inicial" />
              </ImageContainer>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep01} alt="Inserir SIS do responsável" />
              </ImageContainer>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep02} alt="Confirmar data de anivesário do responsável" />
              </ImageContainer>

              <Title level={4}>Passo 3 de 7</Title>
              <Paragraph>
                Confira se seus dados estão <strong>corretos</strong>. Não se esqueça de confirmar.
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep03} alt="Confira seus dados" />
              </ImageContainer>

              <Title level={4}>Passo 4 de 7</Title>
              <Paragraph>
                Pegue a sua <strong>Nota fiscal</strong> do mercado onde fez as compras e veja se ela tem esse
                quadradinho. Ele se chama <strong>QRCode</strong>.
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '90%' }} src={qrCodeImage} alt="Exemplo de QRCode" />
              </ImageContainer>
              <Paragraph>
                Se sua Nota Fiscal tiver o QRCode, selecione <strong>Meu comprovante tem o QRCode</strong>.
              </Paragraph>

              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep04} alt="Selecione QRCode" />
              </ImageContainer>

              <Typography.Paragraph>
                Se não tiver, precisamos que você entregue o comprovante da sua compra para que um responsável possa
                adicionar sua compra na lista da recarga.
              </Typography.Paragraph>
              <Typography.Paragraph>Junto com a nota fiscal, traga seu documento.</Typography.Paragraph>
              <Typography.Paragraph>
                Entregue sua nota fiscal na Secreataria de Educação, no horário de 12:00 às 17:00 no endereço:
                <b> Avenida Getúlio Vargas, 200 - Segundo piso, Centro - Espaço Mascarenhas</b>
              </Typography.Paragraph>

              <Title level={4}>Passo 5 de 7</Title>
              <Paragraph>
                Digite o valor da sua compra no campo <strong>Valor total da compra</strong>.
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep06} alt="Selecione QR-Code" />
              </ImageContainer>

              <Title level={4}>Passo 6 de 7</Title>
              <Paragraph>
                Selecione a opção <strong>Ler código QRCode</strong> e aponte a câmera do seu celular para o QRCode na
                sua <strong>Nota Fiscal</strong>.
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep05} alt="Escaneie o QRCode" />
              </ImageContainer>

              <Title level={4}>Passo 7 de 7</Title>
              <Paragraph>
                <strong>Consumo Efetivado</strong> – Confira os dados da sua compra e{' '}
                <strong>não se esqueça de confirmar.</strong>
              </Paragraph>
              <ImageContainer>
                <img style={{ width: '130%' }} src={imageStep07} alt="Selecione QR-Code" />
              </ImageContainer>
              <Paragraph>
                Você finalizou a prestação de contas. Não se esqueça de <a href="/#saldo">CONSULTAR O SALDO</a> antes de
                qualquer compra.
              </Paragraph>
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

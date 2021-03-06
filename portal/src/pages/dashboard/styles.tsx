import styled from 'styled-components';
import backgroundImage from '../../assets/banner.jpg';
import { Row } from 'antd';
import { Flex } from '../../components/flex';

export const PanelStyle = {
  backgroundColor: '#00000000',
  marginTop: 0
};

export const FooterImageWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
`;

export const PriceLabelStyle = {
  fontSize: '12pt'
} as React.CSSProperties;

export const PriceStyle = {
  color: '#00B41E',
  fontWeight: 'bolder',
  fontSize: '13pt'
} as React.CSSProperties;

export const IconCheckStyle = {
  color: '#2ecc71',
  fontSize: 18,
  marginLeft: 5
};

export const ImageContainer = styled(Flex)`
  flex-direction: column;
  align-items: center;
  padding: ${(props) => props.theme.spacing.md};
`;

export const FooterImageContainer = styled(Flex)`
  height: 40px;
  justify-content: center;
  align-items: center;
`;

export const HeaderContainer = styled(Flex)`
  flex-direction: column;
  align-items: center;
  background-image: url(${backgroundImage});
  background-position: bottom;
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: 0px 0px 2px black;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

export const HeaderContent = styled(Flex)`
  width: 100%;
  height: 100%;
  max-height: 1200px;
  flex-direction: column;
  background-color: #00000080;
  justify-content: center;
  text-align: center;
  padding: ${(props) => props.theme.spacing.lg};
  padding-bottom: 0;
`;

export const PageContainer = styled(Flex)`
  flex-direction: column;
`;

export const PanelActionContainer = styled(Flex)`
  width: 100%;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.md};
  padding-bottom: ${(props) => props.theme.spacing.sm};
`;

export const ActionContainer = styled(Row)`
  padding-top: ${(props) => props.theme.spacing.md};
  padding-bottom: ${(props) => props.theme.spacing.sm};
`;

export const BodyContainer = styled(Flex)`
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.default};
`;

export const Container = styled.div`
  max-width: 800px;
  width: 100%;
  align-self: center;
`;

export const LogoContainer = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.sm};
  img {
    width: 70px;
    height: 70px;
  }
`;

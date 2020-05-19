import styled from 'styled-components';
import backgroundImage from '../../assets/banner.jpg';

export const PanelStyle = {
  backgroundColor: '#00000000',
  marginTop: 0
};

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url(${backgroundImage});
  background-position: bottom;
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: 0px 0px 2px black;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

export const HeaderContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  background-color: #00000080;
  justify-content: center;
  text-align: center;
  padding: ${(props) => props.theme.spacing.lg};
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PanelActionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.md};
  padding-bottom: ${(props) => props.theme.spacing.sm};
`;

export const ActionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.default};
`;

export const Container = styled.div<{ backgroundColor?: string }>`
  max-width: 800px;
  width: 100%;
  align-self: center;
  background-color: ${(props) => props.backgroundColor || 'initial'};
`;

export const LogoContainer = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.sm};
  img {
    width: 70px;
    height: 70px;
  }
`;

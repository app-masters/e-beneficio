import styled from 'styled-components';
import backgroundImage from '../../assets/public-backgroundimage.jpg';

export const PanelStyle = {
  backgroundColor: '#00000000'
};

export const HeaderContainer = styled.div`
  display: flex;
  height: 25%;
  flex-direction: column;
  align-items: center;
  background-image: url(${backgroundImage});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: 0px 0px 2px black;
`;

export const HeaderContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  background-color: #00000055;
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
`;

export const Container = styled.div`
  max-width: 1200px;
  align-self: center;
`;


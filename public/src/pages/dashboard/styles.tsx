import styled from 'styled-components';

export const PanelStyle = {
  backgroundColor: '#00000000'
};

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PanelActionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

export const ActionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${(props) => props.theme.spacing.sm};
  background-color: #fff;
`;

export const EstablishmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.sm};
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.sm};
`;

import styled from 'styled-components';
import media from '../../styles/media';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.sm};

  ${media('md')} {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

export const FormContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgb(0, 0, 0, 0.1);
  top: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ActionWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  > * {
    margin-left: ${(props) => props.theme.spacing.sm};
  }
`;

export const FamilyWrapper = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

export const FamilyActions = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};

  * {
    p,
    .ant-typography {
      margin-bottom: 0 !important;
    }
  }
`;

export const InfoContainer = styled.div`
  display: flex;
  margin: ${(props) => props.theme.spacing.sm} 0;
  justify-content: center;
`;

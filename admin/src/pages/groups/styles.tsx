import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.md};
`;

export const ActionWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  > * {
    margin-left: ${(props) => props.theme.spacing.sm};
  }
`;

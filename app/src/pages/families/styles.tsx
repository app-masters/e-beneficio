import styled from 'styled-components';
import media from '../../styles/media';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.sm};
  max-height: 100vh;
  overflow: auto;
  ${media('md')} {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

export const ActionWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
`;

export const ColCheckStyle = {
  display: 'flex',
  alignItems: 'flex-end'
};

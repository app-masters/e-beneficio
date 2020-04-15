import styled from 'styled-components';
import media from '../../styles/media';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.sm};

  ${media('md')} {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

export const ActionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

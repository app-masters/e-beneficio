import styled from 'styled-components';

export const Wrapper = styled.div<{ width?: number }>`
  max-width: ${(props) => props.width || 300}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Image = styled.img`
  max-width: 40%;
  padding-bottom: ${(props) => props.theme.spacing.default};
`;

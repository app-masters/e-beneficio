import styled from 'styled-components';
import { CSSProperties } from 'react';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.md};
`;

export const ColAlignRight: CSSProperties = {
  textAlign: 'right'
};

import styled from 'styled-components';
import { CSSProperties } from 'react';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.md};
`;

export const ColAlignRight: CSSProperties = {
  textAlign: 'right'
};

export const CounterItem = styled.div<{ bold?: boolean }>`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  font-weight: ${(props) => (props.bold ? 'bold' : '')};
`;

import styled from 'styled-components';
import { Button } from 'antd';

export const ActionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ActionButton = styled(Button)`
  display: inline-block;
  border-radius: 50%;
  && {
    width: ${(props) => props.theme.spacing.md};
    min-width: ${(props) => props.theme.spacing.md};
    height: ${(props) => props.theme.spacing.md};
  }
  padding: 4px;
  font-size: 12px;
`;

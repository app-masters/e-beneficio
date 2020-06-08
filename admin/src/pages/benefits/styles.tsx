import styled from 'styled-components';
import { Col, Divider as AntdDivider } from 'antd';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.md};
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

export const DividerColumn = styled(Col).attrs({ span: 1, style: { display: 'flex' } })`
  justify-content: center;
`;

export const Divider = styled(AntdDivider).attrs({ type: 'vertical' })`
  height: 100%;
`;

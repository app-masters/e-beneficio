import { Spin, Layout } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Sidebar } from '../sidebar';
import { SpinContainer } from './styles';
const { Content } = Layout;

const Wrapper = styled(Layout)`
  height: 100%;
`;

type AdminLayoutProps = {
  loading?: boolean;
};

/**
 * The admin layout. Which defines the default sidebar with content in its middle section
 */
export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return (
    <Wrapper>
      <Sidebar />
      <Layout>
        <Content>
          {props.loading ? (
            <SpinContainer>
              <Spin />
            </SpinContainer>
          ) : (
            props.children
          )}
        </Content>
      </Layout>
    </Wrapper>
  );
};

import { Layout } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Sidebar } from '../Sidebar';
const { Content } = Layout;

const Wrapper = styled(Layout)`
  height: 100%;
`;

/**
 * The admin layout. Which defines the default sidebar with content in its middle section
 */
export const AdminLayout: React.FC = (props) => {
  return (
    <Wrapper>
      <Sidebar />
      <Layout>
        <Content>{props.children}</Content>
      </Layout>
    </Wrapper>
  );
};

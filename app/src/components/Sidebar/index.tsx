import {
  BarChartOutlined,
  CarryOutOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { localStorageConstraints } from '../../utils/constraints';
import { Flex } from '../flex';
import { FixSider, MenuHeight, MenuIcon, CollapseWrapper } from './styles';
import { useWindowDimensions } from '../../utils/viewport';
import { breakpoints } from '../../styles/theme';

const { Sider } = Layout;
const { SubMenu } = Menu;

interface RouteItem {
  group?: boolean;
  path: string;
  icon?: () => React.ReactNode;
  name: string;
  children?: RouteItem[];
  disabled?: boolean;
}

const routes: RouteItem[] = [
  {
    path: '/',
    icon: () => <HomeOutlined />,
    name: 'Início'
  },
  {
    path: '/consumo',
    icon: () => <CarryOutOutlined />,
    name: 'Informar consumo'
  },
  {
    path: '/relatorios',
    icon: () => <BarChartOutlined />,
    name: 'Relatórios',
    disabled: true
  }
];

/**
 * A function the will return a menu item or a sidebar item based on the given item properties
 * @param item The route item object with the route metadata from the route tree
 * @param parentPath the current menu path in the tree(accounting its parent)
 * @param onClick callback for click
 */
const menuItem = (item: RouteItem, parentPath: string, onClick: () => void) => {
  const key = `${parentPath}${item.path}`;
  const maxLength = 30;
  const name = item.name.length > maxLength ? `${item.name.slice(0, maxLength - 3)}...` : item.name;

  /**
   * A component that returns the menu item inner content
   */
  const innerItem = () => (
    <>
      {item.icon && item.icon()}
      <span>{name}</span>
    </>
  );

  const childItems = item.children?.map((navLink) => menuItem(navLink, key, onClick));

  return item.children ? (
    item.group ? (
      <Menu.ItemGroup key={item.path} title={item.name} disabled={item.disabled}>
        {childItems}
      </Menu.ItemGroup>
    ) : (
      <SubMenu key={key} title={<span>{innerItem()}</span>}>
        {childItems}
      </SubMenu>
    )
  ) : (
    <Menu.Item key={key} disabled={item.disabled} onClick={onClick}>
      <Link to={key}>{innerItem()}</Link>
    </Menu.Item>
  );
};

/**
 * The main sidebar component, it contains the main urls
 */
export const Sidebar: React.FC = (props) => {
  const location = useLocation();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // The collapse state for the sidebar
  const [collapsed, setCollapsed] = useState(
    Boolean(localStorage.getItem(localStorageConstraints.SIDEBAR_COLLAPSED)) || false
  );
  useEffect(() => localStorage.setItem(localStorageConstraints.SIDEBAR_COLLAPSED, collapsed.toString()), [collapsed]);

  return (
    <>
      <FixSider>
        <Sider
          collapsible
          theme="light"
          trigger={null}
          collapsed={collapsed}
          width={300}
          // make it mobile friendly
          breakpoint="lg"
          collapsedWidth={width < breakpoints.medium ? '0' : undefined}
        >
          <div>
            {/* <LogoWrapper collapsed={collapsed}>
            <Logo show={!collapsed} src="/logo.png" alt="Admin logo" />
            <Logo show={collapsed} src="/logo-compact.png" alt="Admin logo collapsed" />
          </LogoWrapper> */}
            <MenuIcon onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </MenuIcon>
          </div>
          <MenuHeight>
            <Menu theme="light" mode="inline" defaultSelectedKeys={[location ? location.pathname : '/']}>
              {/* Render the links based on the nav arrays */}
              {routes.map((navLink) => menuItem(navLink, '', () => setCollapsed(true)))}
            </Menu>
          </MenuHeight>
          <Flex vertical={collapsed} alignItems="center" gap="sm" justifyContent="space-between">
            {/* <UserDisplay compact={collapsed} /> */}
            <div />
            <Popover content="Sair">
              <Link to="/logout">
                <Button
                  type="ghost"
                  style={{
                    marginRight: collapsed ? 'auto' : theme.spacing.sm,
                    marginLeft: 'auto',
                    marginBottom: theme.spacing.sm
                  }}
                >
                  <LogoutOutlined />
                </Button>
              </Link>
            </Popover>
          </Flex>
        </Sider>
      </FixSider>
      <CollapseWrapper collapsed={collapsed}>{collapsed && props.children}</CollapseWrapper>
    </>
  );
};

import {
  CarryOutOutlined,
  BankOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { localStorageConstraints, Role } from '../../utils/constraints';
import { Flex } from '../flex';
import { FixSider, MenuHeight, MenuIcon } from './styles';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { User } from '../../interfaces/user';
import { env } from '../../env';

const { Sider } = Layout;
const { SubMenu } = Menu;

const consumptionType = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';

interface RouteItem {
  group?: boolean;
  path: string;
  icon?: () => React.ReactNode;
  name: string;
  children?: RouteItem[];
  disabled?: boolean;
  allowedRoles?: Role[];
  specificToType?: 'ticket' | 'product';
}

const routes: RouteItem[] = [
  {
    path: '/',
    icon: () => <HomeOutlined />,
    name: 'Início'
  },
  {
    path: '/validar',
    icon: () => <BookOutlined />,
    name: 'Validar Produtos',
    specificToType: 'ticket'
  },
  {
    path: '/consumo',
    icon: () => <CarryOutOutlined />,
    name: 'Informar consumo',
    allowedRoles: ['admin', 'manager'],
    specificToType: 'ticket'
  },
  {
    path: '/familias',
    icon: () => <IdcardOutlined />,
    name: 'Famílias',
    allowedRoles: ['admin']
  },
  {
    path: '/relatorios',
    icon: () => <FileTextOutlined />,
    name: 'Relatórios',
    allowedRoles: ['admin'],
    specificToType: 'product',
    children: [
      {
        path: '/consumo',
        name: 'Consumo'
      }
    ]
  },
  {
    path: '/beneficios',
    icon: () => <CarryOutOutlined />,
    name: 'Beneficios',
    allowedRoles: ['admin']
  },
  {
    path: '/usuarios',
    icon: () => <UserOutlined />,
    name: 'Usuários',
    allowedRoles: ['admin']
  },
  // Items only shown in the `ticket` consumption type
  {
    path: '/instituicoes',
    icon: () => <BankOutlined />,
    name: 'Instituições',
    allowedRoles: ['admin'],
    specificToType: 'ticket'
  },

  // Items only shown in the `product` consumption type
  {
    path: '/produtos',
    icon: () => <ShoppingCartOutlined />,
    name: 'Produtos',
    specificToType: 'product'
  },
  {
    path: '/entidades',
    icon: () => <ShopOutlined />,
    name: 'Entidades',
    specificToType: 'product'
  },
  {
    path: '/grupos-de-entidades',
    icon: () => <SolutionOutlined />,
    name: 'Grupo de entidades',
    specificToType: 'product'
  },
  {
    path: '/grupos',
    icon: () => <TeamOutlined />,
    name: 'Grupos',
    specificToType: 'product'
  },
  {
    path: '/origem-do-beneficio',
    icon: () => <BankOutlined />,
    name: 'Origem do benefício',
    allowedRoles: ['admin'],
    specificToType: 'product'
  }
];

/**
 * A function the will return a menu item or a sidebar item based on the given item properties
 * @param item The route item object with the route metadata from the route tree
 * @param parentPath the current menu path in the tree(accounting its parent)
 */
const menuItem = (item: RouteItem, parentPath: string, userRole?: Role) => {
  const key = `${parentPath}${item.path}`;
  const maxLength = 30;
  const name = item.name.length > maxLength ? `${item.name.slice(0, maxLength - 3)}...` : item.name;

  // Only show the menu item if the current consumption type matches the item
  if (item.specificToType && consumptionType !== item.specificToType) return null;

  // Only show the menu item if the user is allowed to see it
  if ((item.allowedRoles && userRole && item.allowedRoles.indexOf(userRole) === -1) || (item.allowedRoles && !userRole))
    return null;

  /**
   * A component that returns the menu item inner content
   */
  const innerItem = () => (
    <>
      {item.icon && item.icon()}
      <span>{name}</span>
    </>
  );

  const childItems = item.children?.map((navLink) => menuItem(navLink, key));

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
    <Menu.Item key={key} disabled={item.disabled}>
      <Link to={key}>{innerItem()}</Link>
    </Menu.Item>
  );
};

/**
 * The main sidebar component, it contains the main urls
 */
export const Sidebar: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();

  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);
  const role = user?.role as Role | undefined;

  // The collapse state for the sidebar
  const [collapsed, setCollapsed] = useState(
    Boolean(localStorage.getItem(localStorageConstraints.SIDEBAR_COLLAPSED)) || false
  );
  useEffect(() => localStorage.setItem(localStorageConstraints.SIDEBAR_COLLAPSED, collapsed.toString()), [collapsed]);

  return (
    <FixSider>
      <Sider collapsible theme="light" trigger={null} collapsed={collapsed} width={300}>
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
            {routes.map((navLink) => menuItem(navLink, '', role))}
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
  );
};

import React from 'react';
import { BrowserRouter, Switch, Route as RouterRoute, RouteProps as RouterRouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/rootReducer';
import { User } from '../interfaces/user';
import { AdminLayout } from '../components/adminLayout';

// Pages
import { LoginPage } from './login';
import { UserList } from './user/list';
import { UserForm } from './user/form';
import { PlaceStoreList } from './placeStore/list';
import { PlaceStoreForm } from './placeStore/form';
import { DashboardPage } from './dashboard';
import { useRefreshToken } from '../utils/auth';
import { LogoutPage } from './logout';
import { ConsumptionForm } from './consumption';
import { FamiliesList } from './families/list';
import { FamiliesForm } from './families/form';

export const roleList = {
  admin: { title: 'Administrador' },
  operator: { title: 'Operador' },
  manager: { title: 'Gerente' },
  financial: { title: 'Financeiro' }
};

export type Role = keyof typeof roleList;

type RouteProps = RouterRouteProps & { allowedRole?: Role | Role[] };

/**
 * Extend react-router-dom route to allow or deny users based on its role and
 * show the route only when the specific type is match
 */
const Route: React.FC<RouteProps> = ({ allowedRole, ...props }) => {
  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);

  // Only show the route if the user is allowed to see it
  const allowedRoles = (allowedRole && !Array.isArray(allowedRole) ? [allowedRole] : allowedRole) as Role[] | undefined;
  if ((allowedRoles && user && allowedRoles.indexOf(user.role as Role) === -1) || (allowedRoles && !user)) return null;

  return <RouterRoute {...props} />;
};

/**
 * Router available only for logged users
 * @param props component props
 */
const PrivateRouter: React.FC<{}> = () => {
  const loading = useRefreshToken();

  return (
    <AdminLayout loading={loading}>
      <>
        <Route path="/logout" component={LogoutPage} />
        <Route path="/consumo" component={ConsumptionForm} />
        <Route exact path="/familias" component={FamiliesList} />
        <Route path="/familias/:id" component={FamiliesForm} />
        <Route path="/usuarios" component={UserList} allowedRole="manager" />
        <Route path="/usuarios/:id" component={UserForm} allowedRole="manager" />
        <Route path="/lojas" component={PlaceStoreList} allowedRole="manager" />
        <Route path="/lojas/:id" component={PlaceStoreForm} allowedRole="manager" />
        {/* Dashboard */}
        <Route path="/" component={DashboardPage} exact />
      </>
    </AdminLayout>
  );
};

/**
 * Router available when the user is not logged
 * @param props component props
 */
const PublicRouter: React.FC<{}> = () => {
  return (
    <Switch>
      <Route path="*">
        <LoginPage />
      </Route>
    </Switch>
  );
};

/**
 * Router component
 * @param props router props
 */
export const Router: React.FC<{}> = (props) => {
  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);

  return (
    <BrowserRouter>
      {user && user.role !== 'admin' ? <PrivateRouter {...props} /> : <PublicRouter {...props} />}
    </BrowserRouter>
  );
};

import React from 'react';
import { BrowserRouter, Switch, Route as RouterRoute, Redirect, RouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/rootReducer';
import { User } from '../interfaces/user';
import { AdminLayout } from '../components/adminLayout';

// Pages
import { LoginPage } from './login';
import { DashboardPage } from './dashboard';
import { PlaceList } from './places/list';
import { PlaceForm } from './places/form';
import { useRefreshToken } from '../utils/auth';
import { LogoutPage } from './logout';
import { BenefitList } from './benefits/list';
import { BenefitForm } from './benefits/form';
import { PlaceStoreList } from './placeStore/list';
import { PlaceStoreForm } from './placeStore/form';
import { UserList } from './user/list';
import { UserForm } from './user/form';
import { InstitutionForm } from './institutions/form';
import { InstitutionList } from './institutions/list';
import { FamiliesList } from './families/list';
import { FamilyForm } from './families/form';
import { ConsumptionForm } from './consumption';
import { ReportList } from './report';
import { ProductValidationList } from './product/validationList';
import { ProductList } from './product/list';
import { ProductForm } from './product/form';
import { Role } from '../utils/constraints';
import { env } from '../env';

/**
 * Extend react-router-dom route to allow or deny users based on its role
 */
const Route: React.FC<RouteProps & { allowedRole?: Role | Role[] }> = ({ allowedRole, ...props }) => {
  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);
  const allowedRoles = (allowedRole && !Array.isArray(allowedRole) ? [allowedRole] : allowedRole) as Role[] | undefined;
  if ((allowedRoles && user && allowedRoles.indexOf(user.role as Role) === -1) || (allowedRoles && !user)) return null;

  return <RouterRoute {...props} />;
};

/**
 * Router available only for when env is ticket
 * @param props component props
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrivateTypeRoute = ({ component, ...rest }: any) => {
  const isTicket = env.REACT_APP_CONSUMPTION_TYPE === 'ticket';
  /**
   * Function to redirect user
   */
  const routeComponent = (props: RouteProps) =>
    !isTicket ? React.createElement(component, props) : <Redirect to={{ pathname: '/' }} />;
  return <Route {...rest} render={routeComponent} />;
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
        {/* Product routes */}
        <Route path="/validar" component={ProductValidationList} />
        <PrivateTypeRoute allowedRole="admin" path="/produtos" component={ProductList} />
        <PrivateTypeRoute allowedRole="admin" path="/produtos/:id" component={ProductForm} />
        {/* Report routes */}
        <Route allowedRole="admin" path="/estabelecimentos" component={PlaceList} />
        {/* Place routes */}
        <Route allowedRole="admin" path="/relatorios" component={ReportList} />
        <Route allowedRole="admin" path="/estabelecimentos/:id" component={PlaceForm} />
        {/* Benefit routes */}
        <Route allowedRole="admin" path="/beneficios" component={BenefitList} />
        <Route allowedRole="admin" path="/beneficios/:id" component={BenefitForm} />
        {/* Store routes */}
        <Route allowedRole="admin" path="/lojas" component={PlaceStoreList} />
        <Route allowedRole="admin" path="/lojas/:id" component={PlaceStoreForm} />
        {/* User routes */}
        <Route allowedRole="admin" path="/usuarios" component={UserList} />
        <Route allowedRole="admin" path="/usuarios/:id" component={UserForm} />
        {/* Institution routes */}
        <Route allowedRole="admin" path="/instituicoes" component={InstitutionList} />
        <Route allowedRole="admin" path="/instituicoes/:id" component={InstitutionForm} />
        {/* Institution routes */}
        <Route allowedRole="admin" path="/familias" component={FamiliesList} />
        <Route allowedRole="admin" path="/familias/:id" component={FamilyForm} />
        {/* Consumptions routes */}
        <Route allowedRole="admin" path="/consumo" component={ConsumptionForm} />
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

  return <BrowserRouter>{user ? <PrivateRouter {...props} /> : <PublicRouter {...props} />}</BrowserRouter>;
};

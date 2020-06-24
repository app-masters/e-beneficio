import React from 'react';
import { BrowserRouter, Switch, Route as RouterRoute, RouteProps as RouterRouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/rootReducer';
import { User } from '../interfaces/user';
import { AdminLayout } from '../components/adminLayout';

// Pages
import { LoginPage } from './login';
import { DashboardPage } from './dashboard';
import { PlaceList } from './place/list';
import { PlaceForm } from './place/form';
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
import { FamiliesForm } from './families/form';
import { ConsumptionForm } from './consumption';
import { ReportList } from './report';
import { ConsumptionFamilyList } from './report/product/consumptionFamily';
import { ConsumptionPlaceStoreList } from './report/product/consumptionPlaceStore';
import { ProductValidationList } from './product/validationList';
import { ProductList } from './product/list';
import { ProductForm } from './product/form';
import { FamiliesForm as FamiliesFormProduct } from './families/product/form';
import { FamiliesList as FamiliesListProduct } from './families/product/list';
import { FamiliesInfo as FamiliesInfoProduct } from './families/product/info';
import { GroupList } from './groups/list';
import { GroupForm } from './groups/form';

import { Role } from '../utils/constraints';
import { env } from '../env';

// Application consumption type
const consumptionType = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';

type RouteProps = RouterRouteProps & { allowedRole?: Role | Role[]; specificToType?: 'ticket' | 'product' };

/**
 * Extend react-router-dom route to allow or deny users based on its role and
 * show the route only when the specific type is match
 */
const Route: React.FC<RouteProps> = ({ allowedRole, specificToType, ...props }) => {
  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);

  // Only show the route if the consumption type matches
  if (specificToType && specificToType !== consumptionType) return null;

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
        {/* Product routes */}
        <Route path="/validar" component={ProductValidationList} specificToType="ticket" />
        <Route path="/produtos" component={ProductList} allowedRole="admin" specificToType="product" />
        <Route path="/produtos/:id" component={ProductForm} allowedRole="admin" specificToType="product" />
        {/* Report routes */}
        <Route exact path="/relatorios" component={ReportList} allowedRole="admin" specificToType="ticket" />
        <Route
          path="/relatorios/consumo-familia"
          component={ConsumptionFamilyList}
          allowedRole="admin"
          specificToType="product"
        />
        <Route
          path="/relatorios/consumo-estabelecimento"
          component={ConsumptionPlaceStoreList}
          allowedRole="admin"
          specificToType="product"
        />
        {/* Place routes */}
        <Route path="/grupos-de-entidades" component={PlaceList} allowedRole="admin" specificToType="product" />
        <Route path="/grupos-de-entidades/:id" component={PlaceForm} allowedRole="admin" specificToType="product" />
        {/* Group routes */}
        <Route path="/grupos" component={GroupList} allowedRole="admin" specificToType="product" />
        <Route path="/grupos/:id" component={GroupForm} allowedRole="admin" specificToType="product" />
        {/* Benefit routes */}
        <Route path="/beneficios" component={BenefitList} allowedRole="admin" />
        <Route path="/beneficios/:id" component={BenefitForm} allowedRole="admin" />
        {/* PlaceStore routes */}
        <Route path="/entidades" component={PlaceStoreList} allowedRole="admin" specificToType="product" />
        <Route path="/entidades/:id" component={PlaceStoreForm} allowedRole="admin" specificToType="product" />
        {/* User routes */}
        <Route path="/usuarios" component={UserList} allowedRole="admin" />
        <Route path="/usuarios/:id" component={UserForm} allowedRole="admin" />
        {/* Institution routes */}
        <Route path="/instituicoes" component={InstitutionList} allowedRole="admin" specificToType="ticket" />
        <Route path="/instituicoes/:id" component={InstitutionForm} allowedRole="admin" specificToType="ticket" />
        {/* Benefit origin routes */}
        <Route path="/origem-do-beneficio" component={InstitutionList} allowedRole="admin" />
        <Route path="/origem-do-beneficio/:id" component={InstitutionForm} allowedRole="admin" />
        {/* Families routes ticket*/}
        <Route path="/familias" component={FamiliesList} allowedRole="admin" specificToType="ticket" />
        <Route path="/familias/:id" component={FamiliesForm} allowedRole="admin" specificToType="ticket" />
        {/* Families routes product*/}
        <Route exact path="/familias" component={FamiliesListProduct} allowedRole="admin" specificToType="product" />
        <Route
          exact
          path="/familias/criar"
          component={FamiliesFormProduct}
          allowedRole="admin"
          specificToType="product"
        />
        <Route
          exact
          path="/familias/:id/editar"
          component={FamiliesFormProduct}
          allowedRole="admin"
          specificToType="product"
        />
        <Route
          exact
          path="/familias/:id/info"
          component={FamiliesInfoProduct}
          allowedRole="admin"
          specificToType="product"
        />
        {/* Consumptions routes */}
        <Route path="/consumo" component={ConsumptionForm} allowedRole="admin" />
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

import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
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
        {/* Report routes */}
        <Route path="/estabelecimentos" component={PlaceList} />
        {/* Place routes */}
        <Route path="/relatorios" component={ReportList} />
        <Route path="/estabelecimentos/:id" component={PlaceForm} />
        {/* Benefit routes */}
        <Route path="/beneficios" component={BenefitList} />
        <Route path="/beneficios/:id" component={BenefitForm} />
        {/* Store routes */}
        <Route path="/lojas" component={PlaceStoreList} />
        <Route path="/lojas/:id" component={PlaceStoreForm} />
        {/* User routes */}
        <Route path="/usuarios" component={UserList} />
        <Route path="/usuarios/:id" component={UserForm} />
        {/* Institution routes */}
        <Route path="/instituicoes" component={InstitutionList} />
        <Route path="/instituicoes/:id" component={InstitutionForm} />
        {/* Institution routes */}
        <Route path="/familias" component={FamiliesList} />
        <Route path="/familias/:id" component={FamilyForm} />
        {/* Consumptions routes */}
        <Route path="/consumo" component={ConsumptionForm} />
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
      {user && user.role === 'admin' ? <PrivateRouter {...props} /> : <PublicRouter {...props} />}
    </BrowserRouter>
  );
};

import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
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
import { ReportList } from './report';
import { FamiliesPage } from './families/list';
import { FamiliesForm } from './families/form';

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
        <Route path="/relatorios" component={ReportList} />
        <Route exact path="/familias" component={FamiliesPage} />
        <Route path="/familias/:id" component={FamiliesForm} />
        <ManagerRouter>
          <Route path="/usuarios" component={UserList} />
          <Route path="/usuarios/:id" component={UserForm} />
          <Route path="/lojas" component={PlaceStoreList} />
          <Route path="/lojas/:id" component={PlaceStoreForm} />
        </ManagerRouter>
        {/* Dashboard */}
        <Route path="/" component={DashboardPage} exact />
      </>
    </AdminLayout>
  );
};

/**
 * Router available when the user is manager
 * @param props component props
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ManagerRouter: React.FC<any> = ({ children }) => {
  const currentUser = useSelector<AppState, User>((state) => state.authReducer.user as User);
  return currentUser.role === 'manager' ? (
    children
  ) : (
    <Redirect
      to={{
        pathname: '/'
      }}
    />
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

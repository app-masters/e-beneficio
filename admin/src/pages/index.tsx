import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../redux/rootReducer';
import { User } from '../interfaces/user';
import { requestGetToken } from '../redux/auth/actions';
import { AdminLayout } from '../components/AdminLayout';

// Pages
import { LoginPage } from './login';
import { DashboardPage } from './dashboard';
import { PlaceList } from './places/list';
import { PlaceForm } from './places/form';

/**
 * Router available only for logged users
 * @param props component props
 */
const PrivateRouter: React.FC<{}> = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // On first render, try to renewal the token
    dispatch(requestGetToken());
  }, []);
  // TODO: better handle the first render to avoid requests without the token
  const loading = useSelector<AppState, boolean>((state) => state.authReducer.loading);
  if (loading) return null;

  return (
    <BrowserRouter>
      <AdminLayout>
        {/* Place routes */}
        <Route path="/estabelecimentos" component={PlaceList} />
        <Route path="/estabelecimentos/:id" component={PlaceForm} />
        {/* Dashboard */}
        <Route path="/" component={DashboardPage} exact />
      </AdminLayout>
    </BrowserRouter>
  );
};

/**
 * Router available when the user is not logged
 * @param props component props
 */
const PublicRouter: React.FC<{}> = (props) => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="*">
          <LoginPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

/**
 * Router component
 * @param props router props
 */
export const Router: React.FC<{}> = (props) => {
  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);
  if (user && user.role === 'admin') {
    return <PrivateRouter {...props} />;
  }
  return <PublicRouter {...props} />;
};

import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../redux/rootReducer';
import { User } from '../interfaces/user';
import { AdminLayout } from '../components/AdminLayout';

// Pages
import { LoginPage } from './login';
import { doGetToken } from '../redux/auth/actions';

/**
 * Router available only for logged users
 * @param props component props
 */
const PrivateRouter: React.FC<{}> = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // On first render, try to renewal the token
    dispatch(doGetToken());
  }, [dispatch]);
  return (
    <BrowserRouter>
      <AdminLayout>
        <Switch>
          <Route path="*">
            <div>Você está dentro do sistema</div>
          </Route>
        </Switch>
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

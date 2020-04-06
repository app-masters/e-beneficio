import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { doGetTokenFailed } from '../../redux/auth/actions';
import { useHistory } from 'react-router-dom';

/**
 * The Logout container component
 */
export const LogoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(doGetTokenFailed());
    history.push('/login');
  }, [dispatch, history]);

  return <div>Deslogando...</div>;
};

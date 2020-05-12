import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { doLogoutUser } from '../../redux/auth/actions';
import { useHistory } from 'react-router-dom';

/**
 * The Logout container component
 */
export const LogoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(doLogoutUser());
    history.push('/');
  }, [dispatch, history]);

  return <div>Deslogando...</div>;
};

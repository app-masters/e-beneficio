import jwt from 'jsonwebtoken';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { requestGetToken } from '../redux/auth/actions';
import { AppState } from '../redux/rootReducer';

/**
 * A hook that refreshes the token and returns if it's loading.
 * This hook must ONLY be called ONCE. Generally in the private router function.
 */
export const useRefreshToken = () => {
  // Gets the actual token from redux
  const token = useSelector<AppState, string | undefined>(({ authReducer }) => authReducer.token);

  // Gets the current URL from router
  const location = useLocation();

  // Gets the dispatch function to be used later
  const dispatch = useDispatch();

  useEffect(() => {
    // If the token exists
    if (token) {
      // Read its payload
      const payload = jwt.decode(token) as { [key: string]: any };

      // If the paylod expiration timestamp has expired and we have an url
      if (payload && payload.exp < Date.now() / 1000 && location.pathname) {
        // Try to refresh the token
        dispatch(requestGetToken());
      }
    } else {
      // If the token does not exist, tries to fetch it
      dispatch(requestGetToken());
    }
  }, [dispatch, token, location.pathname]); // When the token changes and the url changes

  // Returns whether or not the request token request is loading right now.
  return useSelector<AppState, boolean>((state) => state.authReducer.loading);
};

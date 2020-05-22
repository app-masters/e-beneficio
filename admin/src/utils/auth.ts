import jwt from 'jsonwebtoken';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { requestGetToken } from '../redux/auth/actions';
import { AppState } from '../redux/rootReducer';
import { AxiosInstance } from 'axios';
import { localStorageConstraints } from './constraints';
import { TokenResponse } from '../interfaces/auth';

/**
 * Set or clear the default Authorization token on request headers
 * @param token The value to set the token to
 */
export const setAuthorization = (token?: string) => {
  if (token) {
    localStorage.setItem(localStorageConstraints.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(localStorageConstraints.AUTH_TOKEN);
  }
};

/**
 * Set or clear the default Refresh token on request headers
 * @param token The value to set the token to
 */
export const setRefresh = (token?: string) => {
  if (token) {
    localStorage.setItem(localStorageConstraints.REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(localStorageConstraints.REFRESH_TOKEN);
  }
};

/**
 * Gets the current authorization token
 */
export const getAuthorization = () => {
  return localStorage.getItem(localStorageConstraints.AUTH_TOKEN);
};

/**
 * Gets the current refresh token
 */
export const getRefresh = () => {
  return localStorage.getItem(localStorageConstraints.REFRESH_TOKEN);
};

/**
 * A hook that refreshes the token and returns if it's loading.
 * This hook must ONLY be called ONCE. Generally in the private router function.
 */
export const useRefreshToken = () => {
  // Gets the actual token from redux
  const token = getAuthorization();

  // Gets the current URL from router
  const location = useLocation();

  // Gets the dispatch function to be used later
  const dispatch = useDispatch();

  const [didUpdate, setDidUpdate] = useState(false);

  // At the first load
  useEffect(() => {
    // If the user is logged in and did not update yet until the next refresh
    if (token && !didUpdate) {
      // Update the token
      dispatch(requestGetToken());

      // Never update it again until the next browser refresh or the user enter the app
      setDidUpdate(true);
    }
  }, [dispatch, didUpdate, setDidUpdate, token]);

  useEffect(() => {
    // If the token exists
    if (token) {
      // Read its payload
      const payload = jwt.decode(token) as { [key: string]: string | number };

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

/**
 * Wraps the axios with authorization interceptors.
 * @param baseAxios The axios to use as a base
 */
export const createAuthAxios = (baseAxios: AxiosInstance) => {
  // For every request
  baseAxios.interceptors.request.use((config) => {
    // Get the token
    const token = getAuthorization();

    // Attach the token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // For every response
  baseAxios.interceptors.response.use(
    (res) => res, // If succeeded just return the response
    // If there's an error within the response
    async (err) => {
      const { config: originalReq, response: originalRes } = err;

      // If we get a 401 error
      // And we have not tried before
      // And the error is not in the token url(to prevent looping)
      if (
        err.config &&
        originalRes &&
        originalRes.status === 401 &&
        !originalReq._retry &&
        originalReq.url !== '/auth/token'
      ) {
        // Update the retry value so we don't retry more than once
        originalReq._retry = true;

        // Try to refresh the token
        const response = await baseAxios.post<TokenResponse>('/auth/token', { refreshToken: getRefresh() });

        // If successfully got the token
        if (response && response.status === 200 && response.data) {
          // Store the new values
          setAuthorization(response.data.token);
          setRefresh(response.data.refreshToken);

          // Retry the request
          return baseAxios(originalReq);
        }
      }

      // If got to here, it means we can't retry the token. So just return the error we got as normal.
      return Promise.reject(err);
    }
  );

  return baseAxios;
};

import axios from 'axios';
import { TokenResponse } from '../interfaces/auth';
import { PERSIST_KEY } from './constraints';
import { AppState } from '../redux/rootReducer';

const reduxPersist = localStorage.getItem(`persist:${PERSIST_KEY}`);
const parsedReduxPersist = reduxPersist ? JSON.parse(reduxPersist) : undefined;
const parsedAuthRedux: AppState['authReducer'] | undefined = parsedReduxPersist
  ? JSON.parse(parsedReduxPersist.authReducer)
  : undefined;

/**
 * Default axios instance
 */
const backend = axios.create({
  baseURL: process.env.REACT_APP_ENV_BACKEND_HOST,
  headers: parsedAuthRedux && parsedAuthRedux.token ? { Authorization: `Bearer ${parsedAuthRedux.token}` } : undefined
});

/**
 * Set or clear the default Authorization token on request headers
 * @param token JWT token or null
 */
const setAuthorization = (token: TokenResponse['token'] | null) => {
  backend.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
};

export { backend, setAuthorization };

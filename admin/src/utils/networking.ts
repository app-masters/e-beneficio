import axios from 'axios';
import { TokenResponse } from '../interfaces/auth';

/**
 * Default axios instance
 */
const backend = axios.create({
  baseURL: process.env.REACT_APP_ENV_BACKEND_HOST
});

/**
 * Set or clear the default Authorization token on request headers
 * @param token JWT token or null
 */
const setAuthorization = (token: TokenResponse['token'] | null) => {
  backend.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
};

export { backend, setAuthorization };

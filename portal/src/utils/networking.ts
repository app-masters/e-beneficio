import axios from 'axios';
import CryptoJS from 'crypto-js';
import { env } from '../env';
import moment from 'moment';

/**
 * Default axios instance
 */
const backend = axios.create({
  baseURL: env.REACT_APP_ENV_BACKEND_HOST
});

/**
 * Generate the public authorization object
 */
const getAuthorization = () => {
  const authorization = {
    token: env.REACT_APP_ENV_AUTH_TOKEN || '',
    now: moment().toISOString()
  };
  return CryptoJS.AES.encrypt(JSON.stringify(authorization), env.REACT_APP_ENV_AUTH_SECRET || 'some-secret').toString();
};

backend.interceptors.request.use((config) => {
  // Get the token
  const token = getAuthorization();
  // Attach the token
  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export { backend };

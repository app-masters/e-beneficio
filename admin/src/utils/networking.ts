import axios from 'axios';
import { createAuthAxios } from './auth';

/**
 * Default axios instance
 */
const backend = createAuthAxios(
  axios.create({
    baseURL: process.env.REACT_APP_ENV_BACKEND_HOST
  })
);

export { backend };

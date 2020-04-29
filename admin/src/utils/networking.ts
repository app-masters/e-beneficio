import axios from 'axios';
import { createAuthAxios } from './auth';
import { env } from '../env';

/**
 * Default axios instance
 */
const backend = createAuthAxios(
  axios.create({
    baseURL: env.REACT_APP_ENV_BACKEND_HOST
  })
);

export { backend };

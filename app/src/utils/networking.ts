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

/**
 * a
 * @param b64Data a
 * @param contentType a
 * @param sliceSize a
 */
const b64toBlob = (url: string) => {
  return fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const file = new File([blob], 'File name', { type: 'image/png' });
      return file;
    });
};

/**
 * Upload file to the backend
 * @param url endpoint url
 * @param file uploaded file
 */
const uploadFile = async (url: string, fileUrl: string) => {
  const data = new FormData();
  const file = await b64toBlob(fileUrl);
  data.append('image', file);
  return backend.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export { backend, uploadFile };

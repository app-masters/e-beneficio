import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';
import logging from '../utils/logging';

type PublicAuth = {
  now: Date | string | number;
  token: string;
};

/**
 * Handling the public endpoints token
 * @param req - express req
 * @param res - express res
 * @param next - express next
 * @returns void
 */
export const requirePublicAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.headers['authorization'] as string;
    if (!code) {
      return res.status(401).send('Unauthorized');
    }
    const bytes = CryptoJS.AES.decrypt(code, process.env.AUTH_SECRET || 'some-secret');
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as PublicAuth;

    // Validating data;
    const { token } = decryptedData;
    if (!token) {
      console.log(Object.keys(decryptedData));
      logging.critical('Request on public route using invalid object', decryptedData);
      return res.status(401).send('Unauthorized');
    }

    // Check if token match
    if (token !== process.env.AUTH_TOKEN) {
      logging.error('Request on public route with invalid token', decryptedData);
      return res.status(401).send('Unauthorized');
    }

    return next();
  } catch (error) {
    logging.error(error);
    return res.status(500).send(error.message);
  }
};

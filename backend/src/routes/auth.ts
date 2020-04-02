import express from 'express';
import logging from '../utils/logging';
import {
  initializePassport,
  getToken,
  getRefreshToken,
  updateTokenList,
  getFromTokenList,
  authenticateMiddleware,
  refreshTokenMiddleware
} from '../middlewares/auth';
import { getError } from '../utils/errorLibrary';

const router = express.Router({ mergeParams: true });
initializePassport();

router.post(
  '/login',
  // Passport Authentication middleware
  authenticateMiddleware,
  // Returning data to the request
  async (req, res) => {
    try {
      if (req.user) {
        const { user } = req;
        const refreshToken = getRefreshToken(user);
        const response = {
          token: getToken(user),
          refreshToken,
          user
        };
        updateTokenList(refreshToken, response);
        res.json(response);
      }
    } catch (error) {
      logging.error(error);
      res.status(500).send(error.message);
    }
  }
);

/**
 * Route that will be called upon the expiration of a token.
 * If the refresh token is valid it will generate a new token
 * and return it as a response
 */
router.post(
  '/token',
  // Get the person based on the token
  refreshTokenMiddleware,
  // Returning data to the request
  async (req, res) => {
    try {
      if (req.user && req.body?.refreshToken) {
        const { user } = req;
        const refreshToken = req.body.refreshToken as string;
        const lastResponse = getFromTokenList(refreshToken);
        if (lastResponse) {
          const token = getToken(user);
          const response = { refreshToken, token, user };
          res.json(response);
        } else {
          res.json(getError('invalidCredentials'));
        }
      }
    } catch (error) {
      logging.error(error);
      res.status(500).send(error.message);
    }
  }
);

export default router;

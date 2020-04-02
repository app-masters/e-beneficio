import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy, StrategyOptions } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import db from '../schemas';
import { User } from '../schemas/users';
import { getError } from '../utils/errorLibrary';
import { compareHash } from '../utils/crypt';

export type TokenResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

const options: StrategyOptions & { tokenLifeTime?: string | number } = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'undefined-secret',
  tokenLifeTime: process.env.ACCESS_LIFETIME || '5m'
};

const refreshTokenOptions: StrategyOptions & { tokenLifeTime?: string | number } = {
  jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
  secretOrKey: process.env.JWT_SECRET || 'undefined-refresh-secret',
  tokenLifeTime: process.env.REFRESH_LIFETIME || '5d'
};

/**
 * List of sign tokens, this should only be used during development and tests
 * in production you should use Redis
 */
const tokenList: { [key: string]: TokenResponse } = {};

/**
 * JWT strategy - Used on JWT middleware to validate the user
 */
const jwtStrategy = new JWTStrategy(options, async (jwtPayload, done) => {
  // Check if ID is provided on jwt payload
  if (!jwtPayload.id) return done(null, false);
  try {
    // Finding user on local DB
    const user = await db.users.findByPk(jwtPayload.id);
    if (user) {
      // User found on DB
      return done(null, user.toJSON());
    }
    // User not found on DB
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

/**
 * Refresh JSON Web Token strategy
 */
const refreshTokenStrategy = new JWTStrategy(refreshTokenOptions, async (jwtPayload, done) => {
  // Check if ID is provided on jwt payload
  if (!jwtPayload.id) return done(null, false);
  try {
    // Finding user on local DB
    const user = await db.users.findByPk(jwtPayload.id);
    if (user) {
      // User found on DB
      return done(null, user.toJSON());
    }
    // User not found on DB
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

/**
 * Check if user exists on the DB, his password and the rules to log with each type
 * @param email - string with user email
 * @param password - string with user password
 * @returns User
 */
export const loginWithEmailAndPassword = async (email: string, password: string): Promise<User> => {
  // Find user with same email
  const [registeredUser] = await db.users.findAll({ where: { email } });
  // Checking if found a valid user
  if (!registeredUser) throw getError('noUserFoundWithValidEmail'); // User not found

  // Checking password
  if (
    !registeredUser.password ||
    (registeredUser.password && !(await compareHash(password, registeredUser.password)))
  ) {
    throw getError('invalidCredentials'); // Invalid password
  }
  // Check if active
  if (!registeredUser.active) throw getError('inactiveUserLogging');

  // User is valid, return it
  return registeredUser.toJSON() as User;
};

/**
 *  Local login Passport strategy
 */
const localLoginStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    try {
      const user = await loginWithEmailAndPassword(email, password);
      return done(null, user);
    } catch (error) {
      return done(null, false, error);
    }
  }
);

/**
 * Generating JWT with relevant user info
 * @param user DB User
 * @returns JWT
 */
export const getToken = (user: User) => {
  const token = {
    id: user.id
  };
  return jwt.sign(token, options.secretOrKey as string, { expiresIn: options.tokenLifeTime });
};

/**
 * Generate a JWT with longer expiration date that will be used to refresh the
 * current token
 *
 * @param user DB User
 * @returns JWT
 */
export const getRefreshToken = (user: User) => {
  const token = {
    id: user.id
  };
  return jwt.sign(token, refreshTokenOptions.secretOrKey as string, { expiresIn: refreshTokenOptions.tokenLifeTime });
};

/**
 * Update the last Refresh Token response in the storage
 *
 * This data will be used to validate the refresh token on the token request
 *
 * @param refreshToken Refresh JSON Web Token used as key in the storage
 * @param response Response with the last token generated with the refresh token
 */
export const updateTokenList = (refreshToken: string, response: TokenResponse | undefined) => {
  if (response) {
    tokenList[refreshToken] = response;
  } else {
    delete tokenList[refreshToken];
  }
};

/**
 * Check if the Refresh Token is in the storage and return it if exists
 *
 * @param refreshToken Refresh JSON Web Token used as key in the storage
 * @returns The last response associated with the token, if it exists
 */
export const getFromTokenList = (refreshToken: string) => {
  if (refreshToken in tokenList) return tokenList[refreshToken];
  return null;
};

/**
 * Generic handler for Passport callbacks
 * @param req - express req
 * @param res - express res
 * @param next - express next
 * @returns void
 */
const authenticateHandler = (req: Request, res: Response, next: NextFunction) => (
  error: Error,
  user: User,
  info: Error & { status: number }
) => {
  if (error) return res.status(500).send(error);
  if (!user || info) return res.status(info.status || 401).send(info.message || info);
  req.user = user;
  return next();
};

/**
 * Handling the response from the authentication process
 * @param req - express req
 * @param res - express res
 * @param next - express next
 * @returns void
 */
export const authenticateMiddleware = (req: Request, res: Response, next: NextFunction) =>
  passport.authenticate('login', authenticateHandler(req, res, next))(req, res, next);

/**
 * Handling the response from the JWT refreshing process
 * @param req - express req
 * @param res - express res
 * @param next - express next
 * @returns void
 */
export const refreshTokenMiddleware = (req: Request, res: Response, next: NextFunction) =>
  passport.authenticate('token', { session: false }, authenticateHandler(req, res, next))(req, res, next);

/**
 * Handling the response from the JWT checking process
 * @param req - express req
 * @param res - express res
 * @param next - express next
 * @returns void
 */
export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) =>
  passport.authenticate('jwt', { session: false }, authenticateHandler(req, res, next))(req, res, next);

type DoneFunction<T> = (error: Error | null, id: T) => void;
/**
 * Mapper to get relevant user info
 * @param user Authenticating user
 * @param done Finishing Passport callback
 */
const serializeUser = async (user: User, done: DoneFunction<number>) => {
  done(null, user.id || 0);
};

/**
 * Mapper to find user by the relevant info
 * @param id User's ID
 * @param done Finishing Passport callback
 */
const deserializeUser = async (id: User['id'], done: DoneFunction<object | boolean>) => {
  try {
    // Finding user on local DB
    const user = await db.users.findByPk(id as number);
    if (user) {
      // User found on DB
      return done(null, user.toJSON());
    }
    // User not found on DB
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

/**
 * Define Passport methods and strategies
 * @returns passport
 */
export const initializePassport = () => {
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);
  passport.use(jwtStrategy);
  passport.use('login', localLoginStrategy);
  passport.use('token', refreshTokenStrategy);
  return passport;
};

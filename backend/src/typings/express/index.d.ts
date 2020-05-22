import { User } from '../../schemas/users';
import { City } from '../../schemas/cities';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: User;
  }
  export interface IncomingHttpHeaders {
    ['city-id']?: City['id'];
  }
}

declare namespace Express {
  export interface Request {
    user?: User;
  }
}

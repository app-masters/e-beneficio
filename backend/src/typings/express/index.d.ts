import { User } from '../../schemas/users';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: User;
  }
}

declare namespace Express {
  export interface Request {
    user?: User;
  }
}

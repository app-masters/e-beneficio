import { User } from './user';

export type TokenResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

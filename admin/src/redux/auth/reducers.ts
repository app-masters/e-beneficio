import { createReducer } from '@reduxjs/toolkit';
import * as TYPES from './types';
import { LoginUserSuccessAction, LoginUserFailedAction, GetTokenSuccessAction, GetTokenFailedAction } from './actions';
import { User } from '../../interfaces/user';

export interface AuthReducerState {
  token?: string;
  refreshToken?: string;
  user?: User;
  loading: boolean;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<AuthReducerState>(initialState, {
  [TYPES.LOGIN_USER]: (state: AuthReducerState) => {
    state.loading = true;
    state.error = undefined;
  },
  [TYPES.LOGIN_USER_SUCCESS]: (state: AuthReducerState, action: LoginUserSuccessAction) => {
    state.loading = false;
    state.token = action.response.token;
    state.refreshToken = action.response.refreshToken;
    state.user = action.response.user;
  },
  [TYPES.LOGIN_USER_FAILED]: (state: AuthReducerState, action: LoginUserFailedAction) => {
    state.loading = false;
    state.error = action.error;
  },
  [TYPES.GET_TOKEN]: (state: AuthReducerState) => {
    state.loading = true;
  },
  [TYPES.GET_TOKEN_SUCCESS]: (state: AuthReducerState, action: GetTokenSuccessAction) => {
    state.loading = false;
    state.token = action.response.token;
    state.refreshToken = action.response.refreshToken;
    state.user = action.response.user;
  },
  [TYPES.GET_TOKEN_FAILED]: (state: AuthReducerState) => {
    state.loading = false;
    // Token failed, log out the user
    state.token = undefined;
    state.refreshToken = undefined;
    state.user = undefined;
  }
});

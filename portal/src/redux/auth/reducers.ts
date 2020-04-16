import { createReducer } from '@reduxjs/toolkit';
import {
  doLoginUser,
  doLoginUserSuccess,
  doLoginUserFailed,
  doGetToken,
  doGetTokenSuccess,
  doGetTokenFailed
} from './actions';
import { User } from '../../interfaces/user';

export interface AuthReducerState {
  user?: User;
  loading: boolean;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<AuthReducerState>(initialState, {
  [doLoginUser.toString()]: (state: AuthReducerState) => {
    state.loading = true;
    state.error = undefined;
  },
  [doLoginUserSuccess.toString()]: (state: AuthReducerState, action) => {
    state.loading = false;
    state.user = action.payload.user;
  },
  [doLoginUserFailed.toString()]: (state: AuthReducerState, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  [doGetToken.toString()]: (state: AuthReducerState) => {
    state.loading = true;
  },
  [doGetTokenSuccess.toString()]: (state: AuthReducerState, action) => {
    state.loading = false;
    state.user = action.payload.user;
  },
  [doGetTokenFailed.toString()]: (state: AuthReducerState) => {
    state.loading = false;
    // Token failed, log out the user
    state.user = undefined;
  }
});

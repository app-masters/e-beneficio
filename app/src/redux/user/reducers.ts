import { createReducer } from '@reduxjs/toolkit';
import {
  doGetUser,
  doGetUserSuccess,
  doGetUserFailed,
  doSaveUser,
  doSaveUserSuccess,
  doSaveUserFailed,
  doDeleteUser,
  doDeleteUserSuccess,
  doDeleteUserFailed
} from './actions';
import { User } from '../../interfaces/user';
import { addToList } from '../../utils/list';

export interface UserReducerState {
  list: User[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<UserReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetUser, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetUserSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetUserFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveUser, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveUserSuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSaveUserFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteUser, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteUserSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteUserFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

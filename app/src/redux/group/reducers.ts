import { createReducer } from '@reduxjs/toolkit';
import {
  doGetGroup,
  doGetGroupSuccess,
  doGetGroupFailed,
  doSaveGroup,
  doSaveGroupSuccess,
  doSaveGroupFailed,
  doDeleteGroup,
  doDeleteGroupSuccess,
  doDeleteGroupFailed
} from './actions';
import { Group } from '../../interfaces/group';
import { addToList } from '../../utils/list';

export interface GroupReducerState {
  list: Group[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<GroupReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetGroup, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetGroupSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetGroupFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveGroup, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveGroupSuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSaveGroupFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteGroup, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteGroupSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteGroupFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

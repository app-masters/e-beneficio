import { createReducer } from '@reduxjs/toolkit';
import {
  doGetLocality,
  doGetLocalitySuccess,
  doGetLocalityFailed,
  doSaveLocality,
  doSaveLocalitySuccess,
  doSaveLocalityFailed,
  doDeleteLocality,
  doDeleteLocalitySuccess,
  doDeleteLocalityFailed
} from './actions';
import { Locality } from '../../interfaces/locality';
import { addToList } from '../../utils/list';

export interface LocalityReducerState {
  list: Locality[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<LocalityReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetLocality, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetLocalitySuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetLocalityFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveLocality, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveLocalitySuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSaveLocalityFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteLocality, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteLocalitySuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteLocalityFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

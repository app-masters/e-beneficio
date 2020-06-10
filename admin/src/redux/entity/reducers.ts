import { createReducer } from '@reduxjs/toolkit';
import {
  doGetEntity,
  doGetEntitySuccess,
  doGetEntityFailed,
  doSaveEntity,
  doSaveEntitySuccess,
  doSaveEntityFailed,
  doDeleteEntity,
  doDeleteEntitySuccess,
  doDeleteEntityFailed
} from './actions';
import { Entity } from '../../interfaces/entity';
import { addToList } from '../../utils/list';

export interface EntityReducerState {
  list: Entity[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<EntityReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetEntity, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetEntitySuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetEntityFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveEntity, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveEntitySuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSaveEntityFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteEntity, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteEntitySuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteEntityFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

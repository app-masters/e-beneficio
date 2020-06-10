import { createReducer } from '@reduxjs/toolkit';
import {
  doGetPlaceStore,
  doGetPlaceStoreSuccess,
  doGetPlaceStoreFailed,
  doSavePlaceStore,
  doSavePlaceStoreSuccess,
  doSavePlaceStoreFailed,
  doDeletePlaceStore,
  doDeletePlaceStoreSuccess,
  doDeletePlaceStoreFailed
} from './actions';
import { PlaceStore } from '../../interfaces/placeStore';
import { addToList } from '../../utils/list';

export interface PlaceStoreReducerState {
  list: PlaceStore[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<PlaceStoreReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetPlaceStore, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetPlaceStoreSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetPlaceStoreFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSavePlaceStore, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSavePlaceStoreSuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSavePlaceStoreFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeletePlaceStore, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeletePlaceStoreSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeletePlaceStoreFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

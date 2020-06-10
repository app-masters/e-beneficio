import { createReducer } from '@reduxjs/toolkit';
import {
  doGetPlace,
  doGetPlaceSuccess,
  doGetPlaceFailed,
  doSavePlace,
  doSavePlaceSuccess,
  doSavePlaceFailed,
  doDeletePlace,
  doDeletePlaceSuccess,
  doDeletePlaceFailed
} from './actions';
import { Place } from '../../interfaces/place';
import { addToList } from '../../utils/list';

export interface PlaceReducerState {
  list: Place[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<PlaceReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetPlace, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetPlaceSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetPlaceFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSavePlace, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSavePlaceSuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSavePlaceFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeletePlace, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeletePlaceSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeletePlaceFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

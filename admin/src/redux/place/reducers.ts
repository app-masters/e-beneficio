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

export interface PlaceReducerState {
  list: Place[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<PlaceReducerState>(initialState, {
  // Get actions
  [doGetPlace.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doGetPlaceSuccess.toString()]: (state, action) => {
    state.loading = false;
    if (Array.isArray(action.payload)) {
      // User got the list
      state.list = action.payload;
    } else {
      // User got a single item
      const place = action.payload;
      const { list } = state;
      list.filter((item) => item.id !== place.id).unshift(place);
      state.list = list;
    }
  },
  [doGetPlaceFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  // Save actions
  [doSavePlace.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doSavePlaceSuccess.toString()]: (state, action) => {
    state.loading = false;
    state.list = state.list.map((item) => (item.id === action.payload.id ? action.payload : item));
  },
  [doSavePlaceFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  // Delete actions
  [doDeletePlace.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doDeletePlaceSuccess.toString()]: (state, action) => {
    state.loading = false;
    state.list = state.list.filter((item) => item.id !== action.payload.id);
  },
  [doDeletePlaceFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  }
});

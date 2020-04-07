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
import moment from 'moment';

export interface PlaceReducerState {
  list: Place[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

const addToList = (item: Place | null, list: Place[]) => {
  if (item) {
    list = list.filter((listItem) => listItem.id !== item.id);
    list.unshift(item);
  }
  list = list.sort((a, b) => moment(b.createdAt as Date).diff(moment(a.createdAt as Date)));
  return list;
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
      state.list = addToList(null,action.payload);
    } else {
      // User got a single item
      state.list = addToList(action.payload, state.list);
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
    state.list = addToList(action.payload, state.list);
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

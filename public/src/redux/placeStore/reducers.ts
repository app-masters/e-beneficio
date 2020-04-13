import { createReducer } from '@reduxjs/toolkit';
import { doGetPlaceStore, doGetPlaceStoreSuccess, doGetPlaceStoreFailed } from './actions';
import { Place } from '../../interfaces/place';

export interface PlaceReducerState {
  item?: Place | null; // Place | null | undefined
  loading: boolean;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<PlaceReducerState>(initialState, {
  // Get actions
  [doGetPlaceStore.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
    state.item = undefined;
  },
  [doGetPlaceStoreSuccess.toString()]: (state, action) => {
    state.loading = false;
    state.item = action.payload;
  },
  [doGetPlaceStoreFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.item = undefined;
  }
});

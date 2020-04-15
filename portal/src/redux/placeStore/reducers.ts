import { createReducer } from '@reduxjs/toolkit';
import { doGetPlaceStore, doGetPlaceStoreSuccess, doGetPlaceStoreFailed } from './actions';
import { PlaceStore } from '../../interfaces/placeStore';

export interface PlaceReducerState {
  item?: [PlaceStore] | null; // PlaceStore | null | undefined
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

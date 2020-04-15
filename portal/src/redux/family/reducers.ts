import { createReducer } from '@reduxjs/toolkit';
import { doGetFamily, doGetFamilySuccess, doGetFamilyFailed } from './actions';
import { Family } from '../../interfaces/family';

export interface FamilyReducerState {
  item?: Family | null; // Family | null | undefined
  loading: boolean;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<FamilyReducerState>(initialState, {
  // Get actions
  [doGetFamily.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
    state.item = undefined;
  },
  [doGetFamilySuccess.toString()]: (state, action) => {
    state.loading = false;
    state.item = action.payload;
  },
  [doGetFamilyFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.item = undefined;
  }
});

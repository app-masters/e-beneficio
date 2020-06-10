import { createReducer } from '@reduxjs/toolkit';
import {
  doGetFamily,
  doGetFamilySuccess,
  doGetFamilyFailed,
  doSaveFamily,
  doSaveFamilySuccess,
  doSaveFamilyFailed
} from './actions';
import { Family } from '../../interfaces/family';
import { addToList } from '../../utils/list';

export interface FamilyReducerState {
  item?: Family | null;
  list: Family[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
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
  },
  // Save actions
  [doSaveFamily.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doSaveFamilySuccess.toString()]: (state, action) => {
    state.loading = false;
    state.list = addToList(action.payload, state.list);
  },
  [doSaveFamilyFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  }
});

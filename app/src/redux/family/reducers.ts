import { createReducer } from '@reduxjs/toolkit';
import {
  doClearFamily,
  doGetFamily,
  doGetFamilySuccess,
  doGetFamilyFailed,
  doSaveFamily,
  doSaveFamilySuccess,
  doSaveFamilyFailed,
  doDeactivateFamily,
  doDeactivateFamilySuccess,
  doDeactivateFamilyFailed
} from './actions';
import { Family } from '../../interfaces/family';
import { addToList } from '../../utils/list';

export interface FamilyReducerState {
  item?: Family; // Family | null | undefined
  list?: Family[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<FamilyReducerState>(initialState, {
  [doClearFamily.toString()]: (state) => {
    state.loading = false;
    state.error = undefined;
    state.item = undefined;
    state.list = undefined;
  },
  // Get actions
  [doGetFamily.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
    state.item = undefined;
    state.list = undefined;
  },
  [doGetFamilySuccess.toString()]: (state, action) => {
    state.loading = false;
    state.item = !Array.isArray(action.payload) ? action.payload : undefined;
    state.list = Array.isArray(action.payload) ? action.payload : undefined;
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
    state.list = state.list ? addToList(action.payload, state.list) : undefined;
  },
  [doSaveFamilyFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.list = undefined;
  },
  // Deactivte actions
  [doDeactivateFamily.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
    state.item = undefined;
  },
  [doDeactivateFamilySuccess.toString()]: (state, action) => {
    state.loading = false;
    state.list = state.list
      ? addToList(
          action.payload,
          state.list.filter((f) => f.id !== action.payload.id)
        )
      : undefined;
    state.item = undefined;
  },
  [doDeactivateFamilyFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.list = undefined;
    state.item = undefined;
  }
});

import { createReducer } from '@reduxjs/toolkit';
import {
  doGetBenefit,
  doGetBenefitSuccess,
  doGetBenefitFailed,
  doSaveBenefit,
  doSaveBenefitSuccess,
  doSaveBenefitFailed,
  doDeleteBenefit,
  doDeleteBenefitSuccess,
  doDeleteBenefitFailed
} from './actions';
import { Benefit } from '../../interfaces/benefit';
import { addToList } from '../../utils/list';

export interface BenefitReducerState {
  list: Benefit[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<BenefitReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetBenefit, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetBenefitSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetBenefitFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveBenefit, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveBenefitSuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSaveBenefitFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteBenefit, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteBenefitSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteBenefitFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

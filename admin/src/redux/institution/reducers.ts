import { createReducer } from '@reduxjs/toolkit';
import {
  doGetInstitution,
  doGetInstitutionSuccess,
  doGetInstitutionFailed,
  doSaveInstitution,
  doSaveInstitutionSuccess,
  doSaveInstitutionFailed,
  doDeleteInstitution,
  doDeleteInstitutionSuccess,
  doDeleteInstitutionFailed
} from './actions';
import { Institution } from '../../interfaces/institution';
import { addToList } from '../../utils/list';

export interface InstitutionReducerState {
  list: Institution[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<InstitutionReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetInstitution, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetInstitutionSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetInstitutionFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveInstitution, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveInstitutionSuccess, (state, action) => {
      state.loading = false;
      state.list = addToList(action.payload, state.list);
    })
    .addCase(doSaveInstitutionFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteInstitution, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteInstitutionSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteInstitutionFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

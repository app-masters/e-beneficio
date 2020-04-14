import { createReducer } from '@reduxjs/toolkit';
import { CSVReport } from '../../interfaces/csvReport';
import {
  doUploadFamilyFile,
  doUploadFamilyFileFailed,
  doUploadFamilyFileRestart,
  doUploadFamilyFileSuccess
} from './actions';

export interface FamilyReducerState {
  loading: boolean;
  error?: string;
  uploadReport?: CSVReport;
}

const initialState = {
  loading: false
};

export default createReducer<FamilyReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doUploadFamilyFile, (state) => {
      state.loading = true;
      state.error = undefined;
      state.uploadReport = undefined;
    })
    .addCase(doUploadFamilyFileSuccess, (state, action) => {
      state.loading = false;
      state.error = undefined;
      state.uploadReport = action.payload;
    })
    .addCase(doUploadFamilyFileFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.uploadReport = undefined;
    })
    .addCase(doUploadFamilyFileRestart, (state) => {
      state.loading = false;
      state.error = undefined;
      state.uploadReport = undefined;
    })
);

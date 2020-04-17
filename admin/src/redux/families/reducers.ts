import { createReducer } from '@reduxjs/toolkit';
import { CSVReport } from '../../interfaces/csvReport';
import {
  doUploadFamilyFile,
  doUploadFamilyFileFailed,
  doUploadFamilyFileRestart,
  doUploadFamilyFileSuccess,
  doGetDashboardFamily,
  doGetDashboardFamilySuccess,
  doGetDashboardFamilyFailed
} from './actions';
import { DashboardFamily } from '../../interfaces/dashboardFamily';

export interface FamilyReducerState {
  loading: boolean;
  dashboardLoading: boolean;
  error?: string;
  dashboard?: DashboardFamily;
  uploadReport?: CSVReport;
}

const initialState = {
  loading: false,
  dashboardLoading: false
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
    // Get actions
    .addCase(doGetDashboardFamily, (state) => {
      state.dashboardLoading = true;
      state.error = undefined;
    })
    .addCase(doGetDashboardFamilySuccess, (state, action) => {
      state.dashboardLoading = false;
      state.dashboard = action.payload;
    })
    .addCase(doGetDashboardFamilyFailed, (state, action) => {
      state.dashboardLoading = false;
      // state.error = action.payload;
    })
);

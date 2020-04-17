import { createReducer } from '@reduxjs/toolkit';
import { CSVReport } from '../../interfaces/csvReport';
import {
  doUploadFamilyFile,
  doUploadFamilyFileFailed,
  doUploadFamilyFileRestart,
  doUploadFamilyFileSuccess,
  doGetDashboardFamily,
  doGetDashboardFamilySuccess,
  doGetDashboardFamilyFailed,
  doGetFamily,
  doGetFamilySuccess,
  doGetFamilyFailed,
  doSaveFamily,
  doSaveFamilySuccess,
  doSaveFamilyFailed,
  doDeleteFamily,
  doDeleteFamilySuccess,
  doDeleteFamilyFailed
} from './actions';
import { DashboardFamily } from '../../interfaces/dashboardFamily';
import { Family } from '../../interfaces/family';

export interface FamilyReducerState {
  loading: boolean;
  error?: string;
  uploadReport?: CSVReport;

  dashboardLoading: boolean;
  dashboard?: DashboardFamily;

  familyLoading: boolean;
  familyItem?: Family | null;
  familyError?: Error;

  familySaveLoading: boolean;
  familySaveItem?: Family | null;
  familySaveError?: Error;
}

const initialState = {
  loading: false,
  dashboardLoading: false,
  familyLoading: false,
  familySaveLoading: false
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
    .addCase(doGetDashboardFamilyFailed, (state) => {
      state.dashboardLoading = false;
      // state.error = action.payload;
    })
    // Get actions
    .addCase(doGetFamily, (state) => {
      state.familyLoading = true;
      state.familyError = undefined;
      state.familyItem = undefined;
    })
    .addCase(doGetFamilySuccess, (state, action) => {
      state.familyLoading = false;
      state.familyItem = action.payload;
    })
    .addCase(doGetFamilyFailed, (state, action) => {
      state.familyLoading = false;
      state.familyError = action.payload;
      state.familyItem = undefined;
    })
    // Get actions
    .addCase(doSaveFamily, (state) => {
      state.familySaveLoading = true;
      state.familySaveError = undefined;
      state.familySaveItem = undefined;
    })
    .addCase(doSaveFamilySuccess, (state, action) => {
      state.familySaveLoading = false;
      state.familySaveItem = action.payload;
    })
    .addCase(doSaveFamilyFailed, (state, action) => {
      state.familySaveLoading = false;
      state.familySaveError = action.payload;
      state.familySaveItem = undefined;
    })
    // Delete actions
    .addCase(doDeleteFamily, (state) => {
      state.familySaveLoading = true;
      state.familySaveError = undefined;
    })
    .addCase(doDeleteFamilySuccess, (state, action) => {
      state.familySaveLoading = false;
      state.familySaveItem = null;
    })
    .addCase(doDeleteFamilyFailed, (state, action) => {
      state.familySaveLoading = false;
      state.familySaveError = action.payload;
    })
);

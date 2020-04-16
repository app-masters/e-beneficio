import { createReducer } from '@reduxjs/toolkit';
import { doGetDashboard, doGetDashboardSuccess, doGetDashboardFailed } from './actions';
import { Dashboard } from '../../interfaces/dashboard';

export interface DashboardReducerState {
  loading: boolean;
  dashboard?: Dashboard;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<DashboardReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetDashboard, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetDashboardSuccess, (state, action) => {
      state.loading = false;
      state.dashboard = action.payload;
    })
    .addCase(doGetDashboardFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

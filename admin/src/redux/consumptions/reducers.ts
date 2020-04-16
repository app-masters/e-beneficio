import { createReducer } from '@reduxjs/toolkit';
import { doGetConsumption, doGetConsumptionSuccess, doGetConsumptionFailed } from './actions';
import { ConsumptionReport } from '../../interfaces/consumptionReport';

export interface ConsumptionReportReducerState {
  item?: ConsumptionReport;
  loading: boolean;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<ConsumptionReportReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetConsumption, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetConsumptionSuccess, (state, action) => {
      state.loading = false;
      state.item = action.payload;
    })
    .addCase(doGetConsumptionFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

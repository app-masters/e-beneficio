import { createReducer } from '@reduxjs/toolkit';
import {
  doGetConsumption,
  doGetConsumptionSuccess,
  doGetConsumptionFailed,
  doGetConsumptionFamily,
  doGetConsumptionFamilySuccess,
  doGetConsumptionFamilyFailed
} from './actions';
import { Report, ReportConsumptionFamily } from '../../interfaces/report';

export interface ReportReducerState {
  item?: Report;
  loading: boolean;
  error?: Error;

  consumptionFamily?: ReportConsumptionFamily[];
  consumptionFamilyLoading: boolean;
  consumptionFamilyError?: Error;
}

const initialState = {
  loading: false,
  consumptionFamilyLoading: false
};

export default createReducer<ReportReducerState>(initialState, (builder) =>
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
    // Get ConsumptionFamily
    .addCase(doGetConsumptionFamily, (state) => {
      state.consumptionFamilyLoading = true;
      state.consumptionFamilyError = undefined;
    })
    .addCase(doGetConsumptionFamilySuccess, (state, action) => {
      state.consumptionFamilyLoading = false;
      state.consumptionFamily = action.payload;
    })
    .addCase(doGetConsumptionFamilyFailed, (state, action) => {
      state.consumptionFamilyLoading = false;
      state.consumptionFamilyError = action.payload;
    })
);

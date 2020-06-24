import { createReducer } from '@reduxjs/toolkit';
import {
  doGetConsumption,
  doGetConsumptionSuccess,
  doGetConsumptionFailed,
  doGetConsumptionFamily,
  doGetConsumptionFamilySuccess,
  doGetConsumptionFamilyFailed,
  doGetConsumptionPlaceStore,
  doGetConsumptionPlaceStoreSuccess,
  doGetConsumptionPlaceStoreFailed
} from './actions';
import { Report, ReportConsumptionFamily, ReportConsumptionPlaceStore } from '../../interfaces/report';

export interface ReportReducerState {
  item?: Report;
  loading: boolean;
  error?: Error;

  consumptionFamily?: ReportConsumptionFamily[];
  consumptionFamilyLoading: boolean;
  consumptionFamilyError?: Error;

  consumptionPlaceStore?: ReportConsumptionPlaceStore[];
  consumptionPlaceStoreLoading: boolean;
  consumptionPlaceStoreError?: Error;
}

const initialState = {
  loading: false,
  consumptionFamilyLoading: false,
  consumptionPlaceStoreLoading: false
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
      state.consumptionFamilyError = undefined;
    })
    .addCase(doGetConsumptionFamilyFailed, (state, action) => {
      state.consumptionFamilyLoading = false;
      state.consumptionFamilyError = action.payload;
    })
    // Get ConsumptionPlaceStore
    .addCase(doGetConsumptionPlaceStore, (state) => {
      state.consumptionPlaceStoreLoading = true;
      state.consumptionPlaceStoreError = undefined;
    })
    .addCase(doGetConsumptionPlaceStoreSuccess, (state, action) => {
      state.consumptionPlaceStoreLoading = false;
      state.consumptionPlaceStore = action.payload;
      state.consumptionPlaceStoreError = undefined;
    })
    .addCase(doGetConsumptionPlaceStoreFailed, (state, action) => {
      state.consumptionPlaceStoreLoading = false;
      state.consumptionPlaceStoreError = action.payload;
    })
);

import { createReducer } from '@reduxjs/toolkit';
import {
  doGetConsumptionFamily,
  doGetConsumptionFamilySuccess,
  doGetConsumptionFamilyFailed,
  doSaveConsumption,
  doSaveConsumptionSuccess,
  doSaveConsumptionFailed,
  doGetTicketReportFile,
  doGetTicketReportFileSuccess,
  doGetTicketReportFileFailed,
  doDeleteConsumption,
  doDeleteConsumptionSuccess,
  doDeleteConsumptionFailed
} from './actions';
import { Consumption } from '../../interfaces/consumption';

export interface ConsumptionReducerState {
  list: Consumption[];
  registered: Consumption[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  registered: [],
  loading: false
};

export default createReducer<ConsumptionReducerState>(initialState, {
  // Save actions
  [doSaveConsumption.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doSaveConsumptionSuccess.toString()]: (state, action) => {
    state.loading = false;
    state.registered.push(action.payload);
  },
  [doSaveConsumptionFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  // Consumption list actions
  [doGetConsumptionFamily.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doGetConsumptionFamilySuccess.toString()]: (state, action) => {
    state.loading = false;
    state.list = action.payload;
  },
  [doGetConsumptionFamilyFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  // Consumption list actions
  [doGetTicketReportFile.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doGetTicketReportFileSuccess.toString()]: (state) => {
    state.loading = false;
  },
  [doGetTicketReportFileFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  [doDeleteConsumption.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doDeleteConsumptionSuccess.toString()]: (state, action) => {
    state.loading = false;
    state.list = state.list.filter((item) => item.id !== action.id);
  },
  [doDeleteConsumptionFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  }
});

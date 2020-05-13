import { createReducer } from '@reduxjs/toolkit';
import { doSaveConsumption, doSaveConsumptionSuccess, doSaveConsumptionFailed } from './actions';
import { Consumption } from '../../interfaces/consumption';

export interface ConsumptionReducerState {
  registered: Consumption[];
  loading: boolean;
  error?: Error;
}

const initialState = {
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
  }
});

import { createReducer } from '@reduxjs/toolkit';
import { doClearConsumption, doSaveConsumption, doSaveConsumptionSuccess, doSaveConsumptionFailed } from './actions';
import { Consumption } from '../../interfaces/consumption';

export interface ConsumptionReducerState {
  item?: Consumption;
  loading: boolean;
  error?: Error;
}

const initialState = {
  loading: false
};

export default createReducer<ConsumptionReducerState>(initialState, {
  [doClearConsumption.toString()]: (state) => {
    state.loading = false;
    state.error = undefined;
    state.item = undefined;
  },
  [doSaveConsumption.toString()]: (state) => {
    state.loading = true;
    state.error = undefined;
  },
  [doSaveConsumptionSuccess.toString()]: (state, action) => {
    state.loading = false;
    state.item = action.payload;
    state.error = undefined;
  },
  [doSaveConsumptionFailed.toString()]: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  }
});

import { createReducer } from '@reduxjs/toolkit';
import {
  doGetProduct,
  doGetProductSuccess,
  doGetProductFailed,
  doSaveProduct,
  doSaveProductSuccess,
  doSaveProductFailed,
  doDeleteProduct,
  doDeleteProductSuccess,
  doDeleteProductFailed,
} from './actions';
import { Product } from '../../interfaces/product';
import { addToList } from '../../utils/list';

export interface ProductReducerState {
  list: Product[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  loading: false
};

export default createReducer<ProductReducerState>(initialState, (builder) =>
  builder
    // Get actions
    .addCase(doGetProduct, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetProductSuccess, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        // User got the list
        state.list = addToList(null, action.payload);
      } else {
        // User got a single item
        state.list = addToList(action.payload, state.list);
      }
    })
    .addCase(doGetProductFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Save actions
    .addCase(doSaveProduct, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doSaveProductSuccess, (state, action) => {
      state.loading = false;
      // state.list = addToList(action.payload, state.list);
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doSaveProductFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Delete actions
    .addCase(doDeleteProduct, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doDeleteProductSuccess, (state, action) => {
      state.loading = false;
      state.list = state.list.filter((item) => item.id !== action.payload.id);
    })
    .addCase(doDeleteProductFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
);

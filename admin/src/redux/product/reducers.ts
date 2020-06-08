import { createReducer } from '@reduxjs/toolkit';
import {
  doGetProduct,
  doGetProductSuccess,
  doGetProductFailed,
  doGetProductValidate,
  doGetProductValidateSuccess,
  doGetProductValidateFailed,
  doSaveProduct,
  doSaveProductSuccess,
  doSaveProductValidSuccess,
  doSaveProductFailed,
  doDeleteProduct,
  doDeleteProductSuccess,
  doDeleteProductFailed
} from './actions';
import { Product } from '../../interfaces/product';
import { addToList } from '../../utils/list';

export interface ProductReducerState {
  list: Product[];
  listValidate: Product[];
  loading: boolean;
  error?: Error;
}

const initialState = {
  list: [],
  listValidate: [],
  loading: false
};

export default createReducer<ProductReducerState>(initialState, (builder) =>
  builder
    //Get Validation
    .addCase(doGetProductValidate, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetProductValidateSuccess, (state, action) => {
      state.loading = false;
      state.listValidate = action.payload;
    })
    .addCase(doGetProductValidateFailed, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    // Get actions
    .addCase(doGetProduct, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(doGetProductSuccess, (state, action) => {
      state.loading = false;
      state.list = action.payload;
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
      state.list = addToList(action.payload, state.list).sort((a, b) => (a.name > b.name ? 1 : -1));
    })
    .addCase(doSaveProductValidSuccess, (state, action) => {
      state.loading = false;
      state.listValidate = state.listValidate.filter((item) => item.id !== action.payload.id);
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

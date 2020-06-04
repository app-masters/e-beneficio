import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Product } from '../../interfaces/product';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetProduct = createAction<void>('product/GET');
export const doGetProductSuccess = createAction<Product | Product[]>('product/GET_SUCCESS');
export const doGetProductFailed = createAction<Error | undefined>('product/GET_FAILED');

// Simple actions and types
export const doGetProductValidate = createAction<void>('product/GET_VALIDATE');
export const doGetProductValidateSuccess = createAction<Product | Product[]>('product/GET_VALIDATE_SUCCESS');
export const doGetProductValidateFailed = createAction<Error | undefined>('product/GET_VALIDATE_FAILED');

export const doSaveProduct = createAction<void>('product/SAVE');
export const doSaveProductSuccess = createAction<Product>('product/SAVE_SUCCESS');
export const doSaveProductValidSuccess = createAction<Product>('product/SAVE_VALID_SUCCESS');
export const doSaveProductFailed = createAction<Error | undefined>('product/SAVE_FAILED');

export const doDeleteProduct = createAction<void>('product/DELETE');
export const doDeleteProductSuccess = createAction<{ id: number }>('product/DELETE_SUCCESS');
export const doDeleteProductFailed = createAction<Error | undefined>('product/DELETE_FAILED');

/**
 * Get Product Thunk action
 */
export const requestGetProduct = (): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetProduct());
      // Request
      const response = await backend.get<Product | Product[]>(`/products`);

      if (response && response.data) {
        // Request finished
        dispatch(doGetProductSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetProductFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetProductFailed(error));
    }
  };
};

/**
 * Get Product Validate Thunk action
 */
export const requestGetProductValidate = (): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetProductValidate());
      // Request
      const response = await backend.get<Product | Product[]>(`/products/validate`);

      if (response && response.data) {
        // Request finished
        dispatch(doGetProductValidateSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetProductValidateFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetProductFailed(error));
    }
  };
};

/**
 * Save Product Thunk action
 */
export const requestSaveProduct = (
  item: Pick<Product, 'name' | 'id'>,
  isValid: boolean,
  type: string,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doSaveProduct());
      // Request
      let response;
      if (item.id) {
        response = await backend.put<Product>(`/products/${item.id}`, { isValid });
      } else {
        response = await backend.post<Product>(`/products`, { ...item, isValid });
      }
      if (response && response.data) {
        // Request finished
        if (type === 'validation') {
          alert('ASd');
          dispatch(doSaveProductValidSuccess(response.data)); // Dispatch result
        } else dispatch(doSaveProductSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveProductFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doSaveProductFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete Product Thunk action
 */
export const requestDeleteProduct = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetProduct());
      // Request
      console.log(id);
      await backend.delete<void>(`/products/${id || ''}`);
      // Finished
      dispatch(doDeleteProductSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doDeleteProductFailed(error));
    }
  };
};

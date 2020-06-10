import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Locality } from '../../interfaces/locality';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetLocality = createAction<void>('locality/GET');
export const doGetLocalitySuccess = createAction<Locality | Locality[]>('locality/GET_SUCCESS');
export const doGetLocalityFailed = createAction<Error | undefined>('locality/GET_FAILED');

export const doSaveLocality = createAction<void>('locality/SAVE');
export const doSaveLocalitySuccess = createAction<Locality>('locality/SAVE_SUCCESS');
export const doSaveLocalityFailed = createAction<Error | undefined>('locality/SAVE_FAILED');

export const doDeleteLocality = createAction<void>('locality/DELETE');
export const doDeleteLocalitySuccess = createAction<{ id: number }>('locality/DELETE_SUCCESS');
export const doDeleteLocalityFailed = createAction<Error | undefined>('locality/DELETE_FAILED');

/**
 * Get Locality Thunk action
 */
export const requestGetLocality = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetLocality());
      // Request
      const response = await backend.get<Locality | Locality[]>(`/place-stores/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetLocalitySuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetLocalityFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetLocalityFailed(error));
    }
  };
};

/**
 * Save Locality Thunk action
 */
export const requestSaveLocality = (
  item: Pick<Locality, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteLocality());

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Locality>(`/place-stores/${item.id}`, { ...item });
      } else {
        response = await backend.post<Locality>(`/place-stores`, { ...item });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSaveLocalitySuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveLocalityFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doSaveLocalityFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete Locality Thunk action
 */
export const requestDeleteLocality = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetLocality());
      // Request
      await backend.delete<void>(`/place-stores/${id || ''}`);
      // Finished
      dispatch(doDeleteLocalitySuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doDeleteLocalityFailed(error));
    }
  };
};

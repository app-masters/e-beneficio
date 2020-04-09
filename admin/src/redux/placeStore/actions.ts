import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { PlaceStore } from '../../interfaces/placeStore';

// Simple actions and types
export const doGetPlaceStore = createAction<void>('placeStore/GET');
export const doGetPlaceStoreSuccess = createAction<PlaceStore | PlaceStore[]>('placeStore/GET_SUCCESS');
export const doGetPlaceStoreFailed = createAction<Error | undefined>('placeStore/GET_FAILED');

export const doSavePlaceStore = createAction<void>('placeStore/SAVE');
export const doSavePlaceStoreSuccess = createAction<PlaceStore>('placeStore/SAVE_SUCCESS');
export const doSavePlaceStoreFailed = createAction<Error | undefined>('placeStore/SAVE_FAILED');

export const doDeletePlaceStore = createAction<void>('placeStore/DELETE');
export const doDeletePlaceStoreSuccess = createAction<{ id: number }>('placeStore/DELETE_SUCCESS');
export const doDeletePlaceStoreFailed = createAction<Error | undefined>('placeStore/DELETE_FAILED');

/**
 * Get PlaceStore Thunk action
 */
export const requestGetPlaceStore = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetPlaceStore());
      // Request
      const response = await backend.get<PlaceStore | PlaceStore[]>(`/place-stores/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetPlaceStoreSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetPlaceStoreFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetPlaceStoreFailed(error));
    }
  };
};

/**
 * Save PlaceStore Thunk action
 */
export const requestSavePlaceStore = (
  item: Pick<PlaceStore, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doDeletePlaceStore());

      // Request
      let response;
      if (item.id) {
        response = await backend.put<PlaceStore>(`/place-stores/${item.id}`, { ...item });
      } else {
        response = await backend.post<PlaceStore>(`/place-stores`, { ...item });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSavePlaceStoreSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSavePlaceStoreFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doSavePlaceStoreFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete PlaceStore Thunk action
 */
export const requestDeletePlaceStore = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetPlaceStore());
      // Request
      await backend.delete<void>(`/place-stores/${id || ''}`);
      // Finished
      dispatch(doDeletePlaceStoreSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doDeletePlaceStoreFailed(error));
    }
  };
};

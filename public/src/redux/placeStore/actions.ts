import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { PlaceStore } from '../../interfaces/placeStore';

// Simple actions and types
export const doGetPlaceStore = createAction<void>('placeStore/GET');
export const doGetPlaceStoreSuccess = createAction<PlaceStore | PlaceStore[]>('placeStore/GET_SUCCESS');
export const doGetPlaceStoreFailed = createAction<Error | undefined>('placeStore/GET_FAILED');

/**
 * Get place Thunk action
 */
export const requestGetPlaceStore = (cityId: string): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetPlaceStore());
      // Request
      const response = await backend.get<PlaceStore>(`/public/place-stores`, { params: { cityId } });
      if (response && response.data) {
        // Request finished
        dispatch(doGetPlaceStoreSuccess(response.data)); // Dispatch result
      } else {
        // Request finished, but no item was found
        dispatch(doGetPlaceStoreFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetPlaceStoreFailed(error));
    }
  };
};

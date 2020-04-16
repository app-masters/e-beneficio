import { createAction } from '@reduxjs/toolkit';
import { Place } from '../../interfaces/place';
import { User } from '../../interfaces/user';
import { backend } from '../../utils/networking';
import { ThunkResult } from '../store';

// Simple actions and types
export const doGetPlace = createAction<void>('place/GET');
export const doGetPlaceSuccess = createAction<Place | Place[]>('place/GET_SUCCESS');
export const doGetPlaceFailed = createAction<Error | undefined>('place/GET_FAILED');

export const doSavePlace = createAction<void>('place/SAVE');
export const doSavePlaceSuccess = createAction<Place>('place/SAVE_SUCCESS');
export const doSavePlaceFailed = createAction<Error | undefined>('place/SAVE_FAILED');

export const doDeletePlace = createAction<void>('place/DELETE');
export const doDeletePlaceSuccess = createAction<{ id: number }>('place/DELETE_SUCCESS');
export const doDeletePlaceFailed = createAction<Error | undefined>('place/DELETE_FAILED');

/**
 * Get place Thunk action
 */
export const requestGetPlace = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetPlace());
      // Request
      const response = await backend.get<Place | Place[]>(`/places/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetPlaceSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetPlaceFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetPlaceFailed(error));
    }
  };
};

/**
 * Save place Thunk action
 */
export const requestSavePlace = (
  item: Pick<Place, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch(doDeletePlace());
      // Get logged user cityId
      const user = getState().authReducer.user as User;

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Place>(`/places/${item.id}`, { ...item, cityId: user.cityId });
      } else {
        response = await backend.post<Place>(`/places`, { ...item, cityId: user.cityId });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSavePlaceSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSavePlaceFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doSavePlaceFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete place Thunk action
 */
export const requestDeletePlace = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetPlace());
      // Request
      await backend.delete<void>(`/places/${id || ''}`);
      // Finished
      dispatch(doDeletePlaceSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doDeletePlaceFailed(error));
    }
  };
};

import { createAction } from '@reduxjs/toolkit';
import { Entity } from '../../interfaces/entity';
import { User } from '../../interfaces/user';
import { backend } from '../../utils/networking';
import { ThunkResult } from '../store';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetEntity = createAction<void>('entity/GET');
export const doGetEntitySuccess = createAction<Entity | Entity[]>('entity/GET_SUCCESS');
export const doGetEntityFailed = createAction<Error | undefined>('entity/GET_FAILED');

export const doSaveEntity = createAction<void>('entity/SAVE');
export const doSaveEntitySuccess = createAction<Entity>('entity/SAVE_SUCCESS');
export const doSaveEntityFailed = createAction<Error | undefined>('entity/SAVE_FAILED');

export const doDeleteEntity = createAction<void>('entity/DELETE');
export const doDeleteEntitySuccess = createAction<{ id: number }>('entity/DELETE_SUCCESS');
export const doDeleteEntityFailed = createAction<Error | undefined>('entity/DELETE_FAILED');

/**
 * Get entity Thunk action
 */
export const requestGetEntity = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetEntity());
      // Request
      const response = await backend.get<Entity | Entity[]>(`/places/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetEntitySuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetEntityFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetEntityFailed(error));
    }
  };
};

/**
 * Save entity Thunk action
 */
export const requestSaveEntity = (
  item: Pick<Entity, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteEntity());
      // Get logged user cityId
      const user = getState().authReducer.user as User;

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Entity>(`/places/${item.id}`, { ...item, cityId: user.cityId });
      } else {
        response = await backend.post<Entity>(`/places`, { ...item, cityId: user.cityId });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSaveEntitySuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveEntityFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doSaveEntityFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete entity Thunk action
 */
export const requestDeleteEntity = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetEntity());
      // Request
      await backend.delete<void>(`/places/${id || ''}`);
      // Finished
      dispatch(doDeleteEntitySuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doDeleteEntityFailed(error));
    }
  };
};

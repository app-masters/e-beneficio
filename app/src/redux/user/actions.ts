import { createAction } from '@reduxjs/toolkit';
import { User } from '../../interfaces/user';
import { backend } from '../../utils/networking';
import { ThunkResult } from '../store';

// Simple actions and types
export const doGetUser = createAction<void>('user/GET');
export const doGetUserSuccess = createAction<User | User[]>('user/GET_SUCCESS');
export const doGetUserFailed = createAction<Error | undefined>('user/GET_FAILED');

export const doSaveUser = createAction<void>('user/SAVE');
export const doSaveUserSuccess = createAction<User>('user/SAVE_SUCCESS');
export const doSaveUserFailed = createAction<Error | undefined>('user/SAVE_FAILED');

export const doDeleteUser = createAction<void>('user/DELETE');
export const doDeleteUserSuccess = createAction<{ id: number }>('user/DELETE_SUCCESS');
export const doDeleteUserFailed = createAction<Error | undefined>('user/DELETE_FAILED');

/**
 * Get user Thunk action
 */
export const requestGetUser = (id?: number): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch(doGetUser());
      // Request
      const response = await backend.get<User | User[]>(`/users/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetUserSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetUserFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetUserFailed(error));
    }
  };
};

/**
 * Save user Thunk action
 */
export const requestSaveUser = (
  item: Pick<User, 'name' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteUser());
      // Get logged user cityId
      const user = getState().authReducer.user as User;

      // Request
      let response;
      if (item.id) {
        response = await backend.put<User>(`/users/${item.id}`, { ...item, cityId: user.cityId });
      } else {
        response = await backend.post<User>(`/users`, { ...item, cityId: user.cityId });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSaveUserSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveUserFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doSaveUserFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete user Thunk action
 */
export const requestDeleteUser = (id: number): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch(doGetUser());
      // Request
      await backend.delete<void>(`/users/${id || ''}`);
      // Finished
      dispatch(doDeleteUserSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doDeleteUserFailed(error));
    }
  };
};

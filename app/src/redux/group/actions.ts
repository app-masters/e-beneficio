import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Group } from '../../interfaces/group';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetGroup = createAction<void>('group/GET');
export const doGetGroupSuccess = createAction<Group | Group[]>('group/GET_SUCCESS');
export const doGetGroupFailed = createAction<Error | undefined>('group/GET_FAILED');

export const doSaveGroup = createAction<void>('group/SAVE');
export const doSaveGroupSuccess = createAction<Group>('group/SAVE_SUCCESS');
export const doSaveGroupFailed = createAction<Error | undefined>('group/SAVE_FAILED');

export const doDeleteGroup = createAction<void>('group/DELETE');
export const doDeleteGroupSuccess = createAction<{ id: number }>('group/DELETE_SUCCESS');
export const doDeleteGroupFailed = createAction<Error | undefined>('group/DELETE_FAILED');

/**
 * Get Group Thunk action
 */
export const requestGetGroup = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetGroup());
      // Request
      const response = await backend.get<Group | Group[]>(`/groups/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetGroupSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetGroupFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetGroupFailed(error));
    }
  };
};

/**
 * Save Group Thunk action
 */
export const requestSaveGroup = (
  item: Pick<Group, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteGroup());

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Group>(`/groups/${item.id}`, { ...item });
      } else {
        response = await backend.post<Group>(`/groups`, { ...item });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSaveGroupSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveGroupFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doSaveGroupFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete Group Thunk action
 */
export const requestDeleteGroup = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetGroup());
      // Request
      await backend.delete<void>(`/groups/${id || ''}`);
      // Finished
      dispatch(doDeleteGroupSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doDeleteGroupFailed(error));
    }
  };
};

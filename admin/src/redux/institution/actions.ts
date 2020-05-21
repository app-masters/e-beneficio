import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Institution } from '../../interfaces/institution';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetInstitution = createAction<void>('Institution/GET');
export const doGetInstitutionSuccess = createAction<Institution | Institution[]>('Institution/GET_SUCCESS');
export const doGetInstitutionFailed = createAction<Error | undefined>('Institution/GET_FAILED');

export const doSaveInstitution = createAction<void>('Institution/SAVE');
export const doSaveInstitutionSuccess = createAction<Institution>('Institution/SAVE_SUCCESS');
export const doSaveInstitutionFailed = createAction<Error | undefined>('Institution/SAVE_FAILED');

export const doDeleteInstitution = createAction<void>('Institution/DELETE');
export const doDeleteInstitutionSuccess = createAction<{ id: number }>('Institution/DELETE_SUCCESS');
export const doDeleteInstitutionFailed = createAction<Error | undefined>('Institution/DELETE_FAILED');

/**
 * Get Institution Thunk action
 */
export const requestGetInstitution = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetInstitution());
      // Request
      const response = await backend.get<Institution | Institution[]>(`/institutions/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetInstitutionSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetInstitutionFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetInstitutionFailed(error));
    }
  };
};

/**
 * Save Institution Thunk action
 */
export const requestSaveInstitution = (
  item: Pick<Institution, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteInstitution());

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Institution>(`/institutions/${item.id}`, { ...item });
      } else {
        response = await backend.post<Institution>(`/institutions`, { ...item });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSaveInstitutionSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveInstitutionFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doSaveInstitutionFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete Institution Thunk action
 */
export const requestDeleteInstitution = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetInstitution());
      // Request
      await backend.delete<void>(`/institutions/${id || ''}`);
      // Finished
      dispatch(doDeleteInstitutionSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doDeleteInstitutionFailed(error));
    }
  };
};

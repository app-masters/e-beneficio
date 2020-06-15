import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Family } from '../../interfaces/family';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doClearFamily = createAction<void>('family/CLEAR');
export const doGetFamily = createAction<void>('family/GET');
export const doGetFamilySuccess = createAction<Family | Family[]>('family/GET_SUCCESS');
export const doGetFamilyFailed = createAction<Error | undefined>('family/GET_FAILED');

export const doSaveFamily = createAction<void>('family/SAVE');
export const doSaveFamilySuccess = createAction<Family | Family[]>('family/SAVE_SUCCESS');
export const doSaveFamilyFailed = createAction<Error | undefined>('family/SAVE_FAILED');

/**
 * Get family Thunk action
 */
export const requestClearFamily = (): ThunkResult<void> => {
  return async (dispatch) => {
    dispatch(doClearFamily());
  };
};

/**
 * Get family Thunk action
 */
export const requestGetFamily = (code: string): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetFamily());
      // Request
      const response = await backend.get<Family>(`/families`, { params: { code } });
      if (response && response.data) {
        // Request finished
        dispatch(doGetFamilySuccess(response.data)); // Dispatch result
      } else {
        // Request finished, but no item was found
        dispatch(doGetFamilyFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      error.message = error.response ? error.response.data : error.message;
      dispatch(doGetFamilyFailed(error));
    }
  };
};

/**
 * Save Family Thunk action
 */
export const requestSaveFamily = (
  item: Pick<Family, 'code' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doSaveFamily());

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Family>(`/families/${item.id}`, { ...item });
      } else {
        response = await backend.post<Family>(`/families`, { ...item });
      }

      if (response && response.data) {
        // Request finished
        dispatch(doSaveFamilySuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveFamilyFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      error.message = error.response ? error.response.data : error.message;
      dispatch(doSaveFamilyFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Get family Thunk action
 */
export const requestGetPlaceFamilies = (): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetFamily());
      // Request
      const response = await backend.get<Family>(`/families/place`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetFamilySuccess(response.data)); // Dispatch result
      } else {
        // Request finished, but no item was found
        dispatch(doGetFamilyFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetFamilyFailed(error));
    }
  };
};

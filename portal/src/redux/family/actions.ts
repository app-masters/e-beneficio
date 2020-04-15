import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Family } from '../../interfaces/family';

// Simple actions and types
export const doGetFamily = createAction<void>('family/GET');
export const doGetFamilySuccess = createAction<Family | Family[]>('family/GET_SUCCESS');
export const doGetFamilyFailed = createAction<Error | undefined>('family/GET_FAILED');

/**
 * Get family Thunk action
 */
export const requestGetFamily = (nis: string, cityId: string): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetFamily());
      // Request
      const response = await backend.get<Family>(`/public/families`, { params: { nis, cityId } });
      if (response && response.data) {
        // Request finished
        dispatch(doGetFamilySuccess(response.data)); // Dispatch result
      } else {
        // Request finished, but no item was found
        dispatch(doGetFamilyFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetFamilyFailed(error));
    }
  };
};

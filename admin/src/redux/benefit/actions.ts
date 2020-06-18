import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Benefit } from '../../interfaces/benefit';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetBenefit = createAction<void>('benefit/GET');
export const doGetBenefitSuccess = createAction<Benefit | Benefit[]>('benefit/GET_SUCCESS');
export const doGetBenefitFailed = createAction<Error | undefined>('benefit/GET_FAILED');

export const doSaveBenefit = createAction<void>('benefit/SAVE');
export const doSaveBenefitSuccess = createAction<Benefit>('benefit/SAVE_SUCCESS');
export const doSaveBenefitFailed = createAction<Error | undefined>('benefit/SAVE_FAILED');

export const doDeleteBenefit = createAction<void>('benefit/DELETE');
export const doDeleteBenefitSuccess = createAction<{ id: number }>('benefit/DELETE_SUCCESS');
export const doDeleteBenefitFailed = createAction<Error | undefined>('benefit/DELETE_FAILED');

/**
 * Get Benefit Thunk action
 */
export const requestGetBenefit = (id?: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetBenefit());
      // Request
      const response = await backend.get<Benefit | Benefit[]>(`/benefits/${id || ''}`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetBenefitSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetBenefitFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetBenefitFailed(error));
    }
  };
};

/**
 * Save Benefit Thunk action
 */
export const requestSaveBenefit = (
  item: Pick<Benefit, 'title' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteBenefit());

      // Request
      let response;
      if (item.id) {
        response = await backend.put<Benefit>(`/benefits/${item.id}`, { ...item });
      } else {
        response = await backend.post<Benefit>(`/benefits`, { ...item });
      }
      if (response && response.data) {
        // Request finished
        dispatch(doSaveBenefitSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveBenefitFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doSaveBenefitFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Delete Benefit Thunk action
 */
export const requestDeleteBenefit = (id: number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetBenefit());
      // Request
      await backend.delete<void>(`/benefits/${id || ''}`);
      // Finished
      dispatch(doDeleteBenefitSuccess({ id })); // Dispatch result
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doDeleteBenefitFailed(error));
    }
  };
};

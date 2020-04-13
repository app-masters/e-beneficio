import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Consumption } from '../../interfaces/consumption';

// Simple actions and types
export const doSaveConsumption = createAction<void>('consumption/SAVE');
export const doSaveConsumptionSuccess = createAction<Consumption>('consumption/SAVE_SUCCESS');
export const doSaveConsumptionFailed = createAction<Error | undefined>('consumption/SAVE_FAILED');

/**
 * Save consumption Thunk action
 */
export const requestSaveConsumption = (
  item: Pick<Consumption, 'familyId' | 'nfce' | 'proofImageUrl' | 'value'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doSaveConsumption());

      // Request
      const response = await backend.post<Consumption>(`/consumptions`, item);

      if (response && response.data) {
        // Request finished
        dispatch(doSaveConsumptionSuccess(response.data)); // Dispatch result
        if (onSuccess) onSuccess();
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doSaveConsumptionFailed());
        if (onFailure) onFailure();
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doSaveConsumptionFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

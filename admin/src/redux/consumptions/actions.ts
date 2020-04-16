import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { ConsumptionReport } from '../../interfaces/consumptionReport';

// Simple actions and types
export const doGetConsumption = createAction<void>('consumption/GET');
export const doGetConsumptionSuccess = createAction<ConsumptionReport | undefined>('consumption/GET_SUCCESS');
export const doGetConsumptionFailed = createAction<Error | undefined>('consumption/GET_FAILED');

/**
 * Get Consumption Thunk action
 */
export const requestGetConsumption = (
  minDate: string,
  maxDate: string,
  placeId: number,
  placeStoreId?: number
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      //Start request - starting loading state
      dispatch(doGetConsumption());
      // Request
      let url = `/consumptions/report?minDate=${minDate}&maxDate=${maxDate}&placeId=${placeId}`;
      if (placeStoreId) url += `&placeStoreId=${placeStoreId}`;
      const response = await backend.get<ConsumptionReport | undefined>(url);

      if (response && response.data) {
        // Request finished
        dispatch(doGetConsumptionSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetConsumptionFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetConsumptionFailed(error));
    }
  };
};

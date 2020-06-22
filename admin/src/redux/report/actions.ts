import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Report, ReportConsumptionFamily } from '../../interfaces/report';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetConsumption = createAction<void>('consumption/GET');
export const doGetConsumptionSuccess = createAction<Report | undefined>('consumption/GET_SUCCESS');
export const doGetConsumptionFailed = createAction<Error | undefined>('consumption/GET_FAILED');

// Simple actions and types
export const doGetConsumptionFamily = createAction<void>('consumptionFamily/GET');
export const doGetConsumptionFamilySuccess = createAction<ReportConsumptionFamily[]>('consumptionFamily/GET_SUCCESS');
export const doGetConsumptionFamilyFailed = createAction<Error | undefined>('consumptionFamily/GET_FAILED');

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
      const response = await backend.get<Report | undefined>(url);

      if (response && response.data) {
        // Request finished
        dispatch(doGetConsumptionSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetConsumptionFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetConsumptionFailed(error));
    }
  };
};

/**
 * Get ConsumptionFamily Thunk action
 */
export const requestGetConsumptionFamily = (
  rangeFamily: string[],
  rangeConsumption: string[],
  memberCpf: string,
  onlyWithoutConsumption: boolean
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      //Start request - starting loading state
      dispatch(doGetConsumptionFamily());
      // Request
      const familyDate = encodeURIComponent(JSON.stringify(rangeFamily));
      const consumptionDate = encodeURIComponent(JSON.stringify(rangeConsumption));
      let url = `/consumptions/report-family?rangeFamily=${familyDate}&rangeConsumption=${consumptionDate}&memberCpf=${memberCpf}`;
      if (onlyWithoutConsumption) url += `&onlyWithoutConsumption=${onlyWithoutConsumption}`;
      const response = await backend.get<ReportConsumptionFamily[]>(url);

      if (response && response.data) {
        // Request finished
        dispatch(doGetConsumptionFamilySuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetConsumptionFamilyFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetConsumptionFamilyFailed(error));
    }
  };
};

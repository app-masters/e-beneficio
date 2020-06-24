import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Report, ReportConsumptionFamily, ReportConsumptionPlaceStore } from '../../interfaces/report';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doGetConsumption = createAction<void>('consumption/GET');
export const doGetConsumptionSuccess = createAction<Report | undefined>('consumption/GET_SUCCESS');
export const doGetConsumptionFailed = createAction<Error | undefined>('consumption/GET_FAILED');

export const doGetConsumptionFamily = createAction<void>('consumptionFamily/GET');
export const doGetConsumptionFamilySuccess = createAction<ReportConsumptionFamily[]>('consumptionFamily/GET_SUCCESS');
export const doGetConsumptionFamilyFailed = createAction<Error | undefined>('consumptionFamily/GET_FAILED');

export const doGetConsumptionPlaceStore = createAction<void>('consumptionPlaceStore/GET');
export const doGetConsumptionPlaceStoreSuccess = createAction<ReportConsumptionPlaceStore[]>(
  'consumptionPlaceStore/GET_SUCCESS'
);
export const doGetConsumptionPlaceStoreFailed = createAction<Error | undefined>('consumptionPlaceStore/GET_FAILED');

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
      let url = `/consumptions/report-family?`;
      const familyDate = encodeURIComponent(JSON.stringify(rangeFamily));
      url += `rangeFamily=${familyDate}`;
      if (rangeConsumption) {
        const consumptionDate = encodeURIComponent(JSON.stringify(rangeConsumption));
        url += `&rangeConsumption=${consumptionDate}`;
      }
      if (memberCpf) url += `&memberCpf=${memberCpf}`;
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

/**
 * Get ConsumptionPlaceStore Thunk action
 */
export const requestGetConsumptionPlaceStore = (rangeConsumption?: string[]): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      //Start request - starting loading state
      dispatch(doGetConsumptionPlaceStore());
      // Request
      let url = `/consumptions/report-placestore?`;
      if (rangeConsumption) {
        const consumptionDate = encodeURIComponent(JSON.stringify(rangeConsumption));
        url += `rangeConsumption=${consumptionDate}`;
      }
      const response = await backend.get<ReportConsumptionPlaceStore[]>(url);

      if (response && response.data) {
        // Request finished
        dispatch(doGetConsumptionPlaceStoreSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetConsumptionPlaceStoreFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      logging.error(error);
      dispatch(doGetConsumptionPlaceStoreFailed(error));
    }
  };
};

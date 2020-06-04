import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Report } from '../../interfaces/report';
import { logging } from '../../lib/logging';
import { Consumption } from '../../interfaces/consumption';

// Simple actions and types
export const doGetConsumption = createAction<void>('consumption/GET');
export const doGetConsumptionSuccess = createAction<Report | undefined>('consumption/GET_SUCCESS');
export const doGetConsumptionFailed = createAction<Error | undefined>('consumption/GET_FAILED');

export const doSaveConsumption = createAction<void>('consumption/SAVE');
export const doSaveConsumptionSuccess = createAction<Consumption>('consumption/SAVE_SUCCESS');
export const doSaveConsumptionFailed = createAction<Error | undefined>('consumption/SAVE_FAILED');

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
 * Save consumption Thunk action
 */
export const requestSaveConsumption = (
  item: Pick<Consumption, 'familyId' | 'nfce' | 'proofImageUrl' | 'value' | 'invalidValue' | 'reviewedAt'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doSaveConsumption());

      if (!item.proofImageUrl && !item.nfce) {
        throw new Error('Image or NFCe are required');
      }

      // Adding image as File on the form
      const file = item.proofImageUrl
        ? await fetch(item.proofImageUrl)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], 'File name', { type: 'image/png' });
              return file;
            })
        : undefined;

      const data = new FormData();
      data.append('familyId', item.familyId.toString());
      data.append('value', item.value.toString());
      if (item.nfce) data.append('nfce', item.nfce);
      if (item.proofImageUrl && file) data.append('image', file);

      // Request
      const response = await backend.post<Consumption>(`/consumptions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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
      logging.error(error);
      dispatch(doSaveConsumptionFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

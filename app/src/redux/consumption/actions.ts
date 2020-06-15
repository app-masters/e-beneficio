import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Consumption } from '../../interfaces/consumption';
import { logging } from '../../lib/logging';

// Simple actions and types
export const doClearConsumption = createAction<void>('consumption/CLEAR');
export const doSaveConsumption = createAction<void>('consumption/SAVE');
export const doSaveConsumptionSuccess = createAction<Consumption>('consumption/SAVE_SUCCESS');
export const doSaveConsumptionFailed = createAction<Error | undefined>('consumption/SAVE_FAILED');

/**
 * Save consumption Thunk action
 */
export const requestClearConsumptionProduct = (): ThunkResult<void> => {
  return async (dispatch) => {
    dispatch(doClearConsumption());
  };
};

/**
 * Save consumption Thunk action
 */
export const requestSaveConsumptionProduct = (
  item: Pick<Consumption, 'familyId' | 'products' | 'proofImageUrl'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doSaveConsumption());

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
      data.append('products', JSON.stringify(item.products));
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

      if (!item.proofImageUrl) {
        throw new Error('Image is required');
      }

      // Adding image as File on the form
      const file = await fetch(item.proofImageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'File name', { type: 'image/png' });
          return file;
        });

      const data = new FormData();
      data.append('familyId', item.familyId.toString());
      data.append('nfce', item.nfce);
      data.append('value', item.value.toString());
      data.append('image', file);

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

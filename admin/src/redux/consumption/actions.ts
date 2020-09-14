import { createAction } from '@reduxjs/toolkit';
import path from 'path';
import moment from 'moment';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Report } from '../../interfaces/report';
import { logging } from '../../lib/logging';
import { Consumption } from '../../interfaces/consumption';

// Simple actions and types
export const doGetConsumptionFamily = createAction<void>('consumption/GET_FAMILY');
export const doGetConsumptionFamilySuccess = createAction<Consumption[] | undefined>('consumption/GET_SUCCESS_FAMILY');
export const doGetConsumptionFamilyFailed = createAction<Error | undefined>('consumption/GET_FAILED_FAMILY');

export const doGetConsumption = createAction<void>('consumption/GET');
export const doGetConsumptionSuccess = createAction<Report | undefined>('consumption/GET_SUCCESS');
export const doGetConsumptionFailed = createAction<Error | undefined>('consumption/GET_FAILED');

export const doSaveConsumption = createAction<void>('consumption/SAVE');
export const doSaveConsumptionSuccess = createAction<Consumption>('consumption/SAVE_SUCCESS');
export const doSaveConsumptionFailed = createAction<Error | undefined>('consumption/SAVE_FAILED');

export const doGetTicketReportFile = createAction<void>('consumption/GET_TICKET_REPORT_FILE');
export const doGetTicketReportFileSuccess = createAction<void>('consumption/GET_TICKET_REPORT_FILE_SUCCESS');
export const doGetTicketReportFileFailed = createAction<string | undefined>('consumption/GET_TICKET_REPORT_FAILED');

/**
 * Get Consumption Thunk action
 */
export const requestGetConsumptionFamily = (id: string | number): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      //Start request - starting loading state
      dispatch(doGetConsumptionFamily());
      // Request
      const response = await backend.get<Consumption[]>(`/families/consumption?id=` + id);
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
      data.append('invalidValue', item.invalidValue.toString());
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
      if (error && error.message.indexOf('409') < 0) {
        logging.error(error);
      }
      dispatch(doSaveConsumptionFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

/**
 * Request Ticket report file
 */
export const requestTicketReportFile = (
  file: File,
  start?: string,
  end?: string,
  onSuccess?: () => void,
  onFailure?: (error?: string) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    /**
     * Calls the failure functions
     * @param error The error string
     */
    const onError = (error?: string) => {
      dispatch(doGetTicketReportFileFailed(error));
      if (onFailure) onFailure(error);
    };

    try {
      if (file) {
        // If the extension is correct
        if (path.extname(file.name) === '.csv') {
          // Start request - starting loading state
          dispatch(doGetTicketReportFile());

          const data = new FormData();
          data.append('file', file);

          // Request
          const response = await backend.post<string>(`/consumptions/report-ticket`, data, {
            timeout: 1000 * 60 * 60 * 6,
            params: { start, end }
          });
          if (response && response.data && response.status === 200) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Relatorio_Ticket_${moment().format('YYYYMMDDHHmmss')}.csv`);
            document.body.appendChild(link);
            link.click();
            // Request finished
            dispatch(doGetTicketReportFileSuccess()); // Dispatch result
            if (onSuccess) onSuccess();
          } else {
            // Request without response - probably won't happen, but cancel the request
            onError(`Ocorreu um erro no servidor. Tente novamente.`);
          }
        } else {
          onError(`O tipo de arquivo precisa ser .csv.`);
        }
      } else {
        onError(`Nenhum arquivo encontrado.`);
      }
    } catch (error) {
      logging.error(error);
      onError(error.message);
    }
  };
};

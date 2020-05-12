import { createAction } from '@reduxjs/toolkit';
import { backend } from '../../utils/networking';
import { ThunkResult } from '../store';
import path from 'path';
import { CSVReport } from '../../interfaces/csvReport';
import { DashboardFamily } from '../../interfaces/dashboardFamily';
import { Family, ImportReport } from '../../interfaces/family';
import { User } from '../../interfaces/user';

export const doUploadFamilyFile = createAction<void>('families/UPLOAD');
export const doUploadFamilyFileSuccess = createAction<CSVReport>('families/UPLOAD_SUCCESS');
export const doUploadFamilyFileFailed = createAction<string | undefined>('families/UPLOAD_FAILED');
export const doUploadFamilyFileRestart = createAction<void>('families/UPLOAD_RESTART');

export const doUploadSislameFiles = createAction<void>('families/UPLOAD_SISLAME');
export const doUploadSislameFilesSuccess = createAction<{ uploaded: boolean }>('families/UPLOAD_SISLAME_SUCCESS');
export const doUploadSislameFilesFailed = createAction<string | undefined>('families/UPLOAD_SISLAME_FAILED');

export const doGetImportReport = createAction<void>('families/GET_IMPORT_REPORT');
export const doGetImportReportSuccess = createAction<ImportReport>('families/GET_IMPORT_REPORT_SUCCESS');
export const doGetImportReportFailed = createAction<string | undefined>('families/GET_IMPORT_REPORT_FAILED');

export const doStartImportReportSync = createAction<number>('families/START_IMPORT_REPORT_SYNC');
export const doStopImportReportSync = createAction<void>('families/STOP_IMPORT_REPORT_SYNC');

export const doGetDashboardFamily = createAction<void>('dashboardFamily/GET');
export const doGetDashboardFamilySuccess = createAction<DashboardFamily>('dashboardFamily/GET_SUCCESS');
export const doGetDashboardFamilyFailed = createAction<Error | undefined>('dashboardFamily/GET_FAILED');

export const doGetFamily = createAction<void>('family/GET');
export const doGetFamilySuccess = createAction<Family>('family/GET_SUCCESS');
export const doGetFamilyFailed = createAction<Error | undefined>('family/GET_FAILED');

export const doSaveFamily = createAction<void>('family/SAVE');
export const doSaveFamilySuccess = createAction<Family>('family/SAVE_SUCCESS');
export const doSaveFamilyFailed = createAction<Error | undefined>('family/SAVE_FAILED');

export const doDeleteFamily = createAction<void>('family/DELETE');
export const doDeleteFamilySuccess = createAction<{ id: number }>('family/DELETE_SUCCESS');
export const doDeleteFamilyFailed = createAction<Error | undefined>('family/DELETE_FAILED');

/**
 * Save User Thunk action
 */
export const requestUploadFamilyFile = (
  file: File,
  onSuccess?: () => void,
  onFailure?: (error?: string) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    /**
     * Calls the failure functions
     * @param error The error string
     */
    const onError = (error?: string) => {
      dispatch(doUploadFamilyFileFailed(error));
      if (onFailure) onFailure(error);
    };

    try {
      if (file) {
        // If the extension is correct
        if (path.extname(file.name) === '.csv') {
          // Start request - starting loading state
          dispatch(doUploadFamilyFile());

          const data = new FormData();
          data.append('file', file);

          // Request
          const response = await backend.post<CSVReport>(`/families/file`, data, { timeout: 1000 * 60 * 60 * 6 });
          if (response && response.data && response.status === 200) {
            // Request finished
            dispatch(doUploadFamilyFileSuccess(response.data)); // Dispatch result
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
      onError(error.message);
    }
  };
};

/**
 * Stop import Report Sync
 */
export const requestStopImportReportSync = (): ThunkResult<void> => {
  return async (dispatch, getState) => {
    const interval = getState().familiesReducer.importSyncInterval;
    if (interval) {
      // Another sync in progress, stop it
      clearInterval(interval);
    }
    dispatch(doStopImportReportSync());
  };
};

/**
 * Get current import report Thunk action
 */
export const requestGetImportReport = (): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetImportReport());
      // Request
      const response = await backend.get<ImportReport>(`/families/import-status`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetImportReportSuccess(response.data)); // Dispatch result
        if (!response.data.inProgress) {
          dispatch(requestStopImportReportSync());
        }
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetImportReportFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetImportReportFailed(error));
      dispatch(requestStopImportReportSync());
    }
  };
};

/**
 * Start import Report Sync
 */
export const requestStartImportReportSync = (): ThunkResult<void> => {
  return async (dispatch, getState) => {
    let interval = getState().familiesReducer.importSyncInterval;
    if (interval) {
      // Another sync in progress, stop it
      clearInterval(interval);
    }
    dispatch(requestGetImportReport()); // Dispatch the first time, so we will not have to wait
    const time = 1000; // Time between requests in ms
    interval = setInterval(() => dispatch(requestGetImportReport()), time);
    dispatch(doStartImportReportSync(interval));
  };
};

/**
 * Upload family and sislame files Thunk action
 */
export const requestUploadSislameFile = (
  familyFile: File,
  sislameFile: File,
  nurseryFile: File,
  onSuccess?: () => void,
  onFailure?: (error?: string) => void
): ThunkResult<void> => {
  return async (dispatch) => {
    /**
     * Calls the failure functions
     * @param error The error string
     */
    const onError = (error?: string) => {
      dispatch(doUploadSislameFilesFailed(error));
      if (onFailure) onFailure(error);
    };

    try {
      if (familyFile && sislameFile && nurseryFile) {
        // If the extension is correct
        if (
          path.extname(familyFile.name) === '.csv' &&
          path.extname(sislameFile.name) === '.csv' &&
          path.extname(nurseryFile.name) === '.csv'
        ) {
          // Start request - starting loading state
          dispatch(doUploadSislameFiles());

          const data = new FormData();
          data.append('families', familyFile);
          data.append('sislame', sislameFile);
          data.append('nursery', nurseryFile);

          // Request
          const response = await backend.post<{ uploaded: boolean }>(`/families/file-sislame`, data);
          if (response && response.data && response.status === 200) {
            // Request finished
            dispatch(doUploadSislameFilesSuccess(response.data)); // Dispatch result
            if (onSuccess) onSuccess();
            dispatch(requestStartImportReportSync());
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
      onError(error.message);
    }
  };
};

/**
 * Get darshboardFamily Thunk action
 */
export const requestGetDashboardFamily = (): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetDashboardFamily());
      // Request
      const response = await backend.get<DashboardFamily>(`/families/dashboard`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetDashboardFamilySuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetDashboardFamilyFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetDashboardFamilyFailed(error));
    }
  };
};

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

/**
 * Save family Thunk action
 */
export const requestSaveFamily = (
  item: Pick<Family, 'code' | 'id'>,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch(doDeleteFamily());
      // Get logged user cityId
      const user = getState().authReducer.user as User;

      //Request
      let response;
      if (item.id) {
        response = await backend.put<Family>(`/families/${item.id}`, { ...item, cityId: user.cityId });
      } else {
        response = await backend.post<Family>(`/families`, { ...item, cityId: user.cityId });
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
      alert(JSON.stringify(error));
      dispatch(doSaveFamilyFailed(error));
      if (onFailure) onFailure(error);
    }
  };
};

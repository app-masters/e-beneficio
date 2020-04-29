import { createAction } from '@reduxjs/toolkit';
import { backend } from '../../utils/networking';
import { ThunkResult } from '../store';
import path from 'path';
import { CSVReport } from '../../interfaces/csvReport';
import { DashboardFamily } from '../../interfaces/dashboardFamily';
import { Family } from '../../interfaces/family';
import { User } from '../../interfaces/user';

export const doUploadFamilyFile = createAction<void>('families/UPLOAD');
export const doUploadFamilyFileSuccess = createAction<CSVReport>('families/UPLOAD_SUCCESS');
export const doUploadFamilyFileFailed = createAction<string | undefined>('families/UPLOAD_FAILED');
export const doUploadFamilyFileRestart = createAction<void>('families/UPLOAD_RESTART');

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
          // If file is smaller than 2MB
          // if (file.size < 2097152) {
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
          // } else {
          //   dispatch(doUploadFamilyFileFailed());
          //   if (onFailure) onFailure();
          // }
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
      // alert(JSON.stringify(error));
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

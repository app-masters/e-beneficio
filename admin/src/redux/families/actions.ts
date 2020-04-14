import { createAction } from '@reduxjs/toolkit';
import { backend } from '../../utils/networking';
import { ThunkResult } from '../store';
import path from 'path';
import { CSVReport } from '../../interfaces/csvReport';

export const doUploadFamilyFile = createAction<void>('families/UPLOAD');
export const doUploadFamilyFileSuccess = createAction<CSVReport>('families/UPLOAD_SUCCESS');
export const doUploadFamilyFileFailed = createAction<string | undefined>('families/UPLOAD_FAILED');
export const doUploadFamilyFileRestart = createAction<void>('families/UPLOAD_RESTART');

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

import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';
import { Family } from '../../interfaces/family';
import { logging } from '../../utils/logging';

// Simple actions and types
export const doResetFamily = createAction<void>('family/RESET');
export const doGetFamily = createAction<void>('family/GET');
export const doGetFamilySuccess = createAction<Family | Family[]>('family/GET_SUCCESS');
export const doGetFamilyFailed = createAction<Error | undefined>('family/GET_FAILED');

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
      if (error.response) {
        switch (Number(error.response.status)) {
          case 404:
            error.message =
              'Não encontramos nenhuma família utilizando esse NIS.' +
              'Tenha certeza que é o NIS do responsável familiar para conseguir consultar o saldo.';
            break;
          default:
            logging.error(error);
            error.message = 'Ocorreu uma falha inesperada e já fomos avisados. Tente novamente em algumas horas.';
            break;
        }
      } else if (error.message === 'Network Error' && !window.navigator.onLine) {
        error.message =
          'Ocorreu um erro ao conectar ao servidor. ' +
          'Verifique se a conexão com a internet está funcionando corretamente.';
      } else {
        logging.error(error);
        error.message = 'Ocorreu uma falha inesperada e já fomos avisados. Tente novamente em algumas horas.';
      }
      dispatch(doGetFamilyFailed(error));
    }
  };
};

/**
 * Get family Thunk action
 */
export const requestResetFamily = (): ThunkResult<void> => {
  return async (dispatch) => {
    dispatch(doResetFamily());
  };
};

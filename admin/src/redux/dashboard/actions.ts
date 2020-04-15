import { createAction } from '@reduxjs/toolkit';
import { Dashboard } from '../../interfaces/dashboard';
import { ThunkResult } from '../store';
import { backend } from '../../utils/networking';

// Simple actions and types
export const doGetDashboard = createAction<void>('dashboard/GET');
export const doGetDashboardSuccess = createAction<Dashboard>('dashboard/GET_SUCCESS');
export const doGetDashboardFailed = createAction<Error | undefined>('dashboard/GET_FAILED');

/**
 * Get Dashboard Thunk action
 */
export const requestGetDashboard = (): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch(doGetDashboard());
      // Request
      const response = await backend.get<Dashboard>(`/dashboard`);
      if (response && response.data) {
        // Request finished
        dispatch(doGetDashboardSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetDashboardFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetDashboardFailed(error));
    }
  };
};

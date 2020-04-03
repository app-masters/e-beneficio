import * as TYPES from './types';
import { TokenResponse } from '../../interfaces/auth';
import { ThunkResult } from '../store';
import { backend, setAuthorization } from '../../utils/networking';

// Action typing
export interface LoginUserSuccessAction {
  type: typeof TYPES.LOGIN_USER_SUCCESS;
  response: TokenResponse;
}
export interface LoginUserFailedAction {
  type: typeof TYPES.LOGIN_USER_FAILED;
  error?: Error;
}
export interface GetTokenSuccessAction {
  type: typeof TYPES.GET_TOKEN_SUCCESS;
  response: TokenResponse;
}
export interface GetTokenFailedAction {
  type: typeof TYPES.GET_TOKEN_FAILED;
  error?: Error;
}

/**
 * Login success simple action
 * @param response TokenResponse
 */
const doLoginUserSuccess = (response: LoginUserSuccessAction['response']): LoginUserSuccessAction => ({
  type: TYPES.LOGIN_USER_SUCCESS,
  response
});

/**
 * Login failed simple action
 * @param error Error instance
 */
const doLoginUserFailed = (error?: LoginUserFailedAction['error']): LoginUserFailedAction => ({
  type: TYPES.LOGIN_USER_FAILED,
  error
});

/**
 * Login user thunk action
 */
export const doLoginUser = (email: string, password: string): ThunkResult<void> => {
  return async (dispatch) => {
    try {
      // Start request - starting loading state
      dispatch({ type: TYPES.LOGIN_USER });
      const response = await backend.post<TokenResponse>('/auth/login', { email, password });
      if (response && response.data) {
        // Request finished
        setAuthorization(response.data.token); // Set base authorization
        dispatch(doLoginUserSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doLoginUserFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doLoginUserFailed(error));
    }
  };
};

/**
 * Login success simple action
 * @param response TokenResponse
 */
const doGetTokenSuccess = (response: GetTokenSuccessAction['response']): GetTokenSuccessAction => ({
  type: TYPES.GET_TOKEN_SUCCESS,
  response
});

/**
 * Login failed simple action
 * @param error Error instance
 */
const doGetTokenFailed = (error?: GetTokenFailedAction['error']): GetTokenFailedAction => ({
  type: TYPES.GET_TOKEN_FAILED,
  error
});

/**
 * Token renewal process - call on token expiration and on the return to the app
 */
export const doGetToken = (): ThunkResult<void> => {
  return async (dispatch, getState) => {
    try {
      // Start request - starting loading state
      dispatch({ type: TYPES.GET_TOKEN });
      // Getting refresh token from the state
      const refreshToken = getState().authReducer.refreshToken;
      if (!refreshToken) {
        // User never logged
        dispatch(doGetTokenFailed());
        return;
      }
      const response = await backend.post<TokenResponse>('/auth/token', { refreshToken });
      if (response && response.data) {
        // Request finished
        setAuthorization(response.data.token); // Set base authorization
        dispatch(doGetTokenSuccess(response.data)); // Dispatch result
      } else {
        // Request without response - probably won't happen, but cancel the request
        dispatch(doGetTokenFailed());
      }
    } catch (error) {
      // Request failed: dispatch error
      dispatch(doGetTokenFailed(error));
    }
  };
};

import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkMiddleware } from 'redux-thunk';
import rootReducer, { AppState } from './rootReducer';

export type Action = { type: string; [key: string]: any };
export type ThunkResult<R> = ThunkAction<R, AppState, undefined, Action>;

export default createStore(rootReducer, applyMiddleware(thunk as ThunkMiddleware<AppState, Action>));

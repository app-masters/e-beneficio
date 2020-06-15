import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkMiddleware } from 'redux-thunk';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import rootReducer, { AppState } from './rootReducer';
import { PERSIST_KEY } from '../utils/constraints';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action = { type: string; [key: string]: any };
export type ThunkResult<R> = ThunkAction<R, AppState, undefined, Action>;

// Redux-persist config
const persistConfig = {
  key: PERSIST_KEY,
  storage,
  blacklist: ['reportReducer']
} as PersistConfig<AppState>;

// Persist all the reducers
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Generate store and persistor
 */
export default () => {
  const store = createStore(persistedReducer, applyMiddleware(thunk as ThunkMiddleware<AppState, Action>));
  const persistor = persistStore(store);
  return { store, persistor };
};

import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';

const rootReducer = combineReducers({
  authReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;

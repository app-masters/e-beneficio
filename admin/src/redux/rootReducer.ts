import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import placeReducer from './place/reducers';

const rootReducer = combineReducers({
  authReducer,
  placeReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;

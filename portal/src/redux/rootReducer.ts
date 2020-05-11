import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import familyReducer from './family/reducers';

const rootReducer = combineReducers({
  authReducer,
  familyReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;

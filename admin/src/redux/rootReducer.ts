import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import placeReducer from './place/reducers';
import benefitReducer from './benefit/reducers';
import institutionReducer from './institution/reducers';

const rootReducer = combineReducers({
  authReducer,
  placeReducer,
  benefitReducer,
  institutionReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;

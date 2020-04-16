import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import placeReducer from './place/reducers';
import benefitReducer from './benefit/reducers';
import institutionReducer from './institution/reducers';
import placeStoreReducer from './placeStore/reducers';
import userReducer from './user/reducers';
import familiesReducer from './families/reducers';
import consumptionReducer from './consumptions/reducers';

const rootReducer = combineReducers({
  authReducer,
  placeReducer,
  benefitReducer,
  institutionReducer,
  placeStoreReducer,
  userReducer,
  familiesReducer,
  consumptionReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;

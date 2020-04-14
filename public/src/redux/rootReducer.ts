import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import consumptionReducer from './consumption/reducers';
import familyReducer from './family/reducers';
import placeStoreReducer from './placeStore/reducers';

const rootReducer = combineReducers({
  authReducer,
  consumptionReducer,
  familyReducer,
  placeStoreReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;

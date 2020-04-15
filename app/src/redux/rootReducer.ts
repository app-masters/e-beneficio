import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import consumptionReducer from './consumption/reducers';
import familyReducer from './family/reducers';
import userReducer from './user/reducers';
import placeStoreReducer from './placeStore/reducers';
import placeReducer from './place/reducers';

const rootReducer = combineReducers({
  authReducer,
  consumptionReducer,
  familyReducer,
  userReducer,
  placeStoreReducer,
  placeReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
